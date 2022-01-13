import io from 'socket.io-client'
import {
    INITIAL_MSG,
    INCOMING_MSG,
    CHECK_MISSING_MSG,
    PUSH_MSG,
    USER_ONLINE,
    USERS_ONLINE,
} from './messageTypes'
import config from '../config.json'
import { isProd } from '../configuration.js'

let socket

const SECOND = 1000
const MINUTE = 60 * SECOND

let onMessageCb, onUsersOnlineCb, onConnectCb, onDisconnectCb

const portPart = `:${isProd() ? window.location.port : config.port}`
const baseUrl = `${window.location.hostname}${portPart}`

export function connect(login, room) {
    socket = io.connect(baseUrl, { path: '/persistent-chat-ws' })
    notifyUserOnline(login, room)
    socket.on('connect', onConnectCb)
    socket.on('disconnect', onDisconnectCb)
    socket.on(
        PUSH_MSG,
        (incomingMessage) => onMessageCb && onMessageCb(incomingMessage)
    )

    socket.on(
        USERS_ONLINE,
        (users) => onUsersOnlineCb && onUsersOnlineCb(users)
    )
}

export function onConnect(cb) {
    onConnectCb = cb
}

export function onDisconnect(cb) {
    onDisconnectCb = cb
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
            CHECK_MISSING_MSG,
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
