import { v1 } from 'uuid'
import settings from '../settings.json'
import { FullMessageType, PartialMessageType } from '../types/ChatTypes'

export const checkMessageValidity = (m: PartialMessageType) => {
    if (!m) throw new Error('no message')
    const { username, room, text } = m
    if (!username || !room || !text) throw new Error('mal formated message')
    if (!String(username).trim()) throw new Error('empty username')
    if (!String(room).trim()) throw new Error('empty room')
    if (!String(text).trim()) throw new Error('empty message')
    if (m.emojis) {
        if (!Array.isArray(m.emojis)) throw new Error('emojis not an array')
        const areBadMessage = m.emojis.find(
            ({ username, emoji }) =>
                !username ||
                !emoji ||
                !String(username).trim() ||
                !String(emoji).trim()
        )
        if (areBadMessage) throw new Error('bad emojis format')
    }
    return true
}

const formatString = (s: string, limit = 10) =>
    String(s).trim().substring(0, limit)

export const validateMessage = (m: PartialMessageType): FullMessageType => {
    checkMessageValidity(m)
    const { msgId, username, text, room, emojis = [] } = m
    return {
        msgId: msgId ? String(msgId) : v1(),
        username: formatString(username),
        room: formatString(room),
        text: formatString(text, settings.maxMsgSize ?? 2048),
        timestamp: Date.now(),
        validated: true,
        emojis: emojis.map(({ username, emoji }) => ({
            username: formatString(username),
            emoji: formatString(emoji, 4),
        })),
    }
}

export const isString = (value: unknown) => typeof value === 'string'
