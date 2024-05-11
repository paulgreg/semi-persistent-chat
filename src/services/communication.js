import io from 'socket.io-client'
import {
    INITIAL_MSG,
    INCOMING,
    CHECK_MISSING,
    PUSH_MSG,
    USER_ONLINE,
    USERS_ONLINE,
    DELETE,
    DELETE_MSG,
} from './messageTypes.mjs'
import { isProd } from '../configuration.mjs'
import config from '../config.mjs'

let socket

const SECOND = 1000
const MINUTE = 60 * SECOND

let onMessageCb, onUsersOnlineCb, onConnectCb, onDisconnectCb, onDeleteCb

const portPart = `:${isProd() ? window.location.port : config.port}`
const baseUrl = `${window.location.hostname}${portPart}`

export function connect(login, room) {
    socket = io.connect(baseUrl, { path: '/persistent-chat-ws' })
    notifyUserOnline(login, room)
    socket.on('connect', onConnectCb)
    socket.on('disconnect', onDisconnectCb)
    socket.on(PUSH_MSG, (incomingMessage) => onMessageCb?.(incomingMessage))
    socket.on(DELETE_MSG, (uuid) => onDeleteCb?.(uuid))

    socket.on(USERS_ONLINE, (users) => onUsersOnlineCb?.(users))
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

export function onDeleteMessage(cb) {
    onDeleteCb = cb
}

export function onUsersOnline(cb) {
    onUsersOnlineCb = cb
}

export function sendMessage(message) {
    if (socket) socket.emit(INCOMING, message)
}

export function sendDelete(uuid) {
    if (socket) socket.emit(DELETE, uuid)
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
            CHECK_MISSING,
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
