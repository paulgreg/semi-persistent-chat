import { v1 } from 'uuid'
import config from '../config.mjs'

export const checkMessageValidity = (m) => {
    if (!m) throw new Error('no message')
    if (!m.user || !m.room || !m.message)
        throw new Error('mal formated message')
    const { user, room, message } = m
    if (!String(user).trim()) throw new Error('empty user')
    if (!String(room).trim()) throw new Error('empty room')
    if (!String(message).trim()) throw new Error('empty message')
    if (m.emojis) {
        if (!Array.isArray(m.emojis)) throw new Error('emojis not an array')
        const areBadMessage = m.emojis.find(
            ({ user, emoji }) =>
                !user || !emoji || !String(user).trim() || !String(emoji).trim()
        )
        if (areBadMessage) throw new Error('bad emojis format')
    }
    return true
}

const formatString = (s, limit = 10) => String(s).trim().substring(0, limit)

export const validateMessage = (m) => {
    checkMessageValidity(m)
    const { uuid, user, message, room, emojis = [] } = m
    return {
        uuid: uuid ? String(uuid) : v1(),
        user: formatString(user),
        room: formatString(room),
        message: formatString(message, config.maxMsgSize ?? 2048),
        timestamp: Date.now(),
        validated: true,
        emojis: emojis.map(({ user, emoji }) => ({
            user: formatString(user),
            emoji: formatString(emoji, 4),
        })),
    }
}
