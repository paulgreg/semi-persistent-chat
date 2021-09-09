const { v1 } = require('uuid')
const { maxMsgSize = 2048 } = require('../config.json')

function checkMessageValidity(m) {
    if (!m) throw new Error('no message')
    if (!m.user || !m.room || !m.message)
        throw new Error('mal formated message')
    const { user, room, message } = m
    if (!String(user).trim()) throw new Error('empty user')
    if (!String(room).trim()) throw new Error('empty room')
    if (!String(message).trim()) throw new Error('empty message')
    return true
}

function validateMessage(m) {
    checkMessageValidity(m)
    const { uuid, user, message, room } = m
    return {
        uuid: uuid ? String(uuid) : v1(),
        user: String(user).trim().substring(0, 10),
        room: String(room).trim().substring(0, 10),
        message: String(message).trim().substring(0, maxMsgSize),
        timestamp: Date.now(),
        validated: true,
    }
}
module.exports = {
    checkMessageValidity,
    validateMessage,
}
