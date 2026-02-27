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

const cleanupWindowMs = (settings.cleanupTimeInHours ?? 6) * HOUR

const roomTtlSeconds = Math.max(60, Math.floor(cleanupWindowMs / 1000))

const roomKey = (room: string) => `spc:room:${room}:messages`

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
    await client.sendCommand(['ZADD', key, String(score), value])
}

const zRangeByScore = async (
    key: string,
    min: number,
    max: number
): Promise<Array<string>> => {
    const reply = await client.sendCommand([
        'ZRANGEBYSCORE',
        key,
        String(min),
        String(max),
    ])
    return Array.isArray(reply) ? (reply as Array<string>) : []
}

const zRemRangeByScore = async (key: string, min: string, max: number) => {
    await client.sendCommand(['ZREMRANGEBYSCORE', key, min, String(max)])
}

const zRem = async (key: string, member: string) => {
    await client.sendCommand(['ZREM', key, member])
}

const expireKey = async (key: string, seconds: number) => {
    await client.sendCommand(['EXPIRE', key, String(seconds)])
}

const scanKeys = async (pattern: string): Promise<Array<string>> => {
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
}

export const initMessageStore = async () => {
    if (!client.isOpen) {
        await client.connect()
    }
}

export const getMessagesForRoom = async (
    room: string
): Promise<Array<FullMessageType>> => {
    if (!room) return []
    const now = Date.now()
    const cutoff = now - cleanupWindowMs
    const members = await zRangeByScore(roomKey(room), cutoff, now)
    await purgeOldMessagesForRoom(room)
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
    const cutoff = now - cleanupWindowMs
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
    const cutoff = now - cleanupWindowMs

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

const purgeOldMessagesForRoom = async (room: string) => {
    const cutoff = getCutoffTimestamp()
    const key = roomKey(room)
    await zRemRangeByScore(key, '-inf', cutoff)
    if (d.enabled) {
        d(`purged old messages from ${key}`)
    }
}

export const addMessage = async (message: FullMessageType) => {
    const key = roomKey(message.room)
    const payload = JSON.stringify(message)
    await zAdd(key, message.timestamp, payload)
    await expireKey(key, roomTtlSeconds)
    await purgeOldMessagesForRoom(message.room)
}

export const updateMessage = async (message: FullMessageType) => {
    const key = roomKey(message.room)
    const existing = await findMemberByMsgId(message.room, message.msgId)
    if (existing) {
        await zRem(key, existing.member)
    }
    const payload = JSON.stringify(message)
    await zAdd(key, message.timestamp, payload)
    await expireKey(key, roomTtlSeconds)
    await purgeOldMessagesForRoom(message.room)
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

export const closeMessageStore = async () => {
    if (client.isOpen) {
        await client.quit()
    }
}
