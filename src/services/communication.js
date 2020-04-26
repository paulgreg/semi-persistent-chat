import { port } from '../config.json'
import io from 'socket.io-client'
import {
    PUSH_MSG,
    USERS_ONLINE,
    INCOMING_MSG,
    INITIAL_MSG,
    USER_ONLINE,
} from './messageTypes'

const prod = process.env.NODE_ENV !== 'production'

const portPart = prod ? `:${port}` : ''
const baseUrl = `${window.location.hostname}${portPart}`

let socket

const SECOND = 1000
const MINUTE = 60 * SECOND

let onMessageCb, onUsersOnlineCb

export function connect(login, room) {
    socket = io.connect(baseUrl, { path: '/persistent-chat-ws' })
    notifyUserOnline(login, room)
    socket.on(
        PUSH_MSG,
        (incomingMessage) => onMessageCb && onMessageCb(incomingMessage)
    )

    socket.on(
        USERS_ONLINE,
        (users) => onUsersOnlineCb && onUsersOnlineCb(users)
    )
}

export function onIncomingMessage(cb) {
    onMessageCb = cb
}

export function onUsersOnline(cb) {
    onUsersOnlineCb = cb
}

export function sendMessage(message) {
    if (socket) socket.emit(INCOMING_MSG, message)
}

export function getInitialMessages() {
    if (!socket) return Promise.resolve()
    return new Promise((resolve) => {
        socket.on(INITIAL_MSG, function (initialMessages) {
            resolve(initialMessages)
        })
    })
}

export function checkMissingMessages(messages) {
    if (socket)
        socket.emit(
            checkMissingMessages,
            messages.map(({ uuid }) => uuid)
        )
}

let notifyTimeout

export function notifyUserOnline(username, room) {
    if (!socket || !username || !room) return
    clearTimeout(notifyTimeout)
    socket.emit(USER_ONLINE, { username, room })
    notifyTimeout = setTimeout(
        notifyUserOnline.bind(this, username, room),
        MINUTE
    )
}

export function disconnect() {
    if (socket) socket.close()
}
