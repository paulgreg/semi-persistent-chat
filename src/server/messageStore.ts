import debug from 'debug'
import { createClient } from 'redis'
import settings from '../settings.json'
import { FullMessageType } from '../types/ChatTypes'

const d = debug('chat:redis')

const redisHost = process.env.REDIS_HOST ?? settings.redisHost ?? '127.0.0.1'
const redisPort = Number(process.env.REDIS_PORT ?? settings.redisPort ?? 6379)
const redisPassword = process.env.REDIS_PASSWORD ?? undefined

const redisUrl = `redis://${redisHost}:${redisPort}`

const client = createClient({
    url: redisUrl,
    password: redisPassword || undefined,
})

client.on('error', (err) => {
    console.error('redis client error', err)
})

const SECOND = 1000
const HOUR = 60 * 60 * SECOND

const cleanupWindowMs = (settings.messageRetentionHours ?? 6) * HOUR

const roomTtlSeconds = Math.max(60, Math.floor(cleanupWindowMs / 1000))

const roomKey = (room: string) => `spc:room:${room}:messages`

// Hourly cleanup for all rooms
const setupHourlyCleanup = async () => {
    const purgeAllOldMessages = async () => {
        try {
            const roomKeys = await scanKeys('spc:room:*:messages')
            const cutoff = getCutoffTimestamp()

            for (const key of roomKeys) {
                await zRemRangeByScore(key, '-inf', cutoff)
                if (d.enabled) {
                    d(`hourly purge: removed old messages from ${key}`)
                }
            }
        } catch (err) {
            console.error('Hourly cleanup failed:', err)
        }
    }

    // Run immediately and then every hour
    await purgeAllOldMessages()
    setInterval(purgeAllOldMessages, 60 * 60 * 1000)
}

const parseMessage = (raw: string): FullMessageType | undefined => {
    try {
        return JSON.parse(raw) as FullMessageType
    } catch (err) {
        console.error('failed to parse message from redis', err)
        return undefined
    }
}

const getCutoffTimestamp = () => Date.now() - cleanupWindowMs

const zAdd = async (key: string, score: number, value: string) => {
    try {
        await client.sendCommand(['ZADD', key, String(score), value])
    } catch (err) {
        console.error('Failed to add to sorted set:', err)
        throw err
    }
}

const zRangeByScore = async (
    key: string,
    min: number,
    max: number
): Promise<Array<string>> => {
    try {
        const reply = await client.sendCommand([
            'ZRANGEBYSCORE',
            key,
            String(min),
            String(max),
        ])
        return Array.isArray(reply) ? (reply as Array<string>) : []
    } catch (err) {
        console.error('Failed to range by score:', err)
        return []
    }
}

const zRemRangeByScore = async (key: string, min: string, max: number) => {
    try {
        await client.sendCommand(['ZREMRANGEBYSCORE', key, min, String(max)])
    } catch (err) {
        console.error('Failed to remove range by score:', err)
        throw err
    }
}

const zRem = async (key: string, member: string) => {
    try {
        await client.sendCommand(['ZREM', key, member])
    } catch (err) {
        console.error('Failed to remove from sorted set:', err)
        throw err
    }
}

const expireKey = async (key: string, seconds: number) => {
    try {
        await client.sendCommand(['EXPIRE', key, String(seconds)])
    } catch (err) {
        console.error('Failed to set key expiration:', err)
        throw err
    }
}

const scanKeys = async (pattern: string): Promise<Array<string>> => {
    try {
        let cursor = '0'
        const keys: Array<string> = []
        do {
            const reply = await client.sendCommand([
                'SCAN',
                cursor,
                'MATCH',
                pattern,
                'COUNT',
                '100',
            ])
            if (Array.isArray(reply) && reply.length === 2) {
                cursor = String(reply[0])
                const batch = Array.isArray(reply[1])
                    ? (reply[1] as Array<string>)
                    : []
                keys.push(...batch)
            } else {
                break
            }
        } while (cursor !== '0')
        return keys
    } catch (err) {
        console.error('Failed to scan keys:', err)
        return []
    }
}

export const initMessageStore = async () => {
    if (!client.isOpen) {
        await client.connect()
    }

    // Start hourly cleanup
    await setupHourlyCleanup()
}

export const getMessagesForRoom = async (
    room: string
): Promise<Array<FullMessageType>> => {
    if (!room) return []
    const now = Date.now()
    const cutoff = getCutoffTimestamp()
    const members = await zRangeByScore(roomKey(room), cutoff, now)

    return members
        .map(parseMessage)
        .filter((m): m is FullMessageType => Boolean(m))
}

const findMemberByMsgId = async (
    room: string,
    msgId: string
): Promise<{ member: string; message: FullMessageType } | undefined> => {
    if (!room || !msgId) return undefined
    const now = Date.now()
    const cutoff = getCutoffTimestamp()
    const members = await zRangeByScore(roomKey(room), cutoff, now)
    for (const member of members) {
        const message = parseMessage(member)
        if (message?.msgId === msgId) {
            return { member, message }
        }
    }
    return undefined
}

const findMemberByMsgIdAcrossRooms = async (
    msgId: string
): Promise<
    { key: string; member: string; message: FullMessageType } | undefined
> => {
    if (!msgId) return undefined
    const now = Date.now()
    const cutoff = getCutoffTimestamp()

    const keys = await scanKeys('spc:room:*:messages')
    for (const key of keys) {
        const members = await zRangeByScore(key, cutoff, now)
        for (const member of members) {
            const message = parseMessage(member)
            if (message?.msgId === msgId) {
                return { key, member, message }
            }
        }
    }
    return undefined
}

export const addMessage = async (message: FullMessageType) => {
    const roomKeyName = roomKey(message.room)
    const payload = JSON.stringify(message)
    await zAdd(roomKeyName, message.timestamp, payload)
    await expireKey(roomKeyName, roomTtlSeconds)
}

export const updateMessage = async (message: FullMessageType) => {
    const roomKeyName = roomKey(message.room)
    const existing = await findMemberByMsgId(message.room, message.msgId)
    if (existing) {
        await zRem(roomKeyName, existing.member)
    }
    const payload = JSON.stringify(message)
    await zAdd(roomKeyName, message.timestamp, payload)
    await expireKey(roomKeyName, roomTtlSeconds)
}

export const deleteMessage = async (
    msgId: string
): Promise<FullMessageType | undefined> => {
    if (!msgId) return undefined
    const found = await findMemberByMsgIdAcrossRooms(msgId)
    if (!found) return undefined
    await zRem(found.key, found.member)
    return found.message
}

export const getRepliesForMessage = async (
    msgId: string,
    room: string
): Promise<Array<FullMessageType>> => {
    if (!msgId || !room) return []
    const now = Date.now()
    const cutoff = getCutoffTimestamp()
    const members = await zRangeByScore(roomKey(room), cutoff, now)

    return members
        .map(parseMessage)
        .filter((m): m is FullMessageType => Boolean(m))
        .filter((message) => message.replyToId === msgId)
}

export const resetMessageAndRepliesExpiration = async (
    msgId: string,
    room: string
): Promise<void> => {
    if (!msgId || !room) return

    const now = Date.now()
    const cutoff = getCutoffTimestamp()
    const members = await zRangeByScore(roomKey(room), cutoff, now)
    const messages = members
        .map(parseMessage)
        .filter((m): m is FullMessageType => Boolean(m))

    // Find original message and all its replies
    const original = messages.find((m) => m.msgId === msgId)
    const replies = messages.filter((m) => m.replyToId === msgId)

    // Reset expiration by updating timestamps to now
    const newTimestamp = Date.now()

    if (original) {
        const updatedOriginal = { ...original, timestamp: newTimestamp }
        await updateMessage(updatedOriginal)
    }

    for (const reply of replies) {
        const updatedReply = { ...reply, timestamp: newTimestamp }
        await updateMessage(updatedReply)
    }
}

export const closeMessageStore = async () => {
    if (client.isOpen) {
        await client.quit()
    }
}
