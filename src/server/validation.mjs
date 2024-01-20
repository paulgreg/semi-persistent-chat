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
    return true
}

export const validateMessage = (m) => {
    checkMessageValidity(m)
    const { uuid, user, message, room } = m
    return {
        uuid: uuid ? String(uuid) : v1(),
        user: String(user).trim().substring(0, 10),
        room: String(room).trim().substring(0, 10),
        message: String(message)
            .trim()
            .substring(0, config.maxMsgSize ?? 2048),
        timestamp: Date.now(),
        validated: true,
    }
}
