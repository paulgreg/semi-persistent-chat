import io, { Socket } from 'socket.io-client'
import {
    INITIAL_MSG,
    INCOMING,
    CHECK_MISSING,
    PUSH_MSG,
    USER_ONLINE,
    USERS_ONLINE,
    DELETE,
    DELETE_MSG,
} from './messageTypes'
import { isProd } from '../configuration'
import debug from 'debug'
import {
    EmojiUserType,
    EventCheckMissingType,
    EventDeleteType,
    EventIncomingMessageType,
    EventInitialMessagesType,
    EventPushType,
    EventUserOnlineType,
    EventUsersOnlineType,
    FullMessageType,
    PartialMessageType,
    UsersType,
} from '../types/ChatTypes'
import settings from '../settings.json'

const d = debug('communication')

let socket: Socket

const SECOND = 1000
const MINUTE = 60 * SECOND

export type onIncomingMessageCbType = (m: FullMessageType) => void
export type onConnectCbType = () => void
export type onDisconnectCbType = () => void
export type onDeleteCbType = (msgId: string) => void
export type onUserOnlineCbType = (users: UsersType) => void
export type onKickCbType = () => void

let onIncomingMessageCb: onIncomingMessageCbType,
    onUsersOnlineCb: onUserOnlineCbType,
    onConnectCb: onConnectCbType,
    onDisconnectCb: onDisconnectCbType,
    onDeleteCb: onDeleteCbType

const portPart = `:${isProd() ? window.location.port : settings.port}`
const baseUrl = `${window.location.hostname}${portPart}`

export const connect = (login: string, room: string) => {
    socket = io(baseUrl, { path: '/persistent-chat-ws' })
    notifyUserOnline(login, room)
    socket.on('connect', onConnectCb)
    socket.on('disconnect', onDisconnectCb)
    socket.on(PUSH_MSG, (payload: EventPushType) =>
        onIncomingMessageCb?.(payload.message)
    )
    socket.on(DELETE_MSG, (payload: EventDeleteType) =>
        onDeleteCb?.(payload.msgId)
    )
    socket.on(USERS_ONLINE, (payload: EventUsersOnlineType) =>
        onUsersOnlineCb?.(payload.users)
    )
}

export const onConnect = (cb: onConnectCbType) => {
    onConnectCb = cb
}

export const onDisconnect = (cb: onDisconnectCbType) => {
    onDisconnectCb = cb
}

export const onIncomingMessage = (cb: onIncomingMessageCbType) => {
    onIncomingMessageCb = cb
}

export const onDeleteMessage = (cb: onDeleteCbType) => {
    onDeleteCb = cb
}

export const onUsersOnline = (cb: onUserOnlineCbType) => {
    onUsersOnlineCb = cb
}

export const sendMessage = (message: PartialMessageType) => {
    const payload: EventIncomingMessageType = {
        message,
    }
    socket.emit(INCOMING, payload)
}

export const sendDelete = (msgId: string) => {
    const payload: EventDeleteType = { msgId }
    socket?.emit(DELETE, payload)
}

export const getInitialMessages = (): Promise<Array<FullMessageType>> => {
    if (!socket) return Promise.resolve([])
    return new Promise((resolve) => {
        socket.on(INITIAL_MSG, (payload: EventInitialMessagesType) => {
            const { initialMessages } = payload
            resolve(initialMessages)
            if (d.enabled) d('getInitialMessages', initialMessages)
        })
    })
}

export const checkMissingMessages = (messages: Array<FullMessageType>) => {
    if (socket) {
        const receivedMsgs = messages.reduce(
            (acc: Record<string, Array<EmojiUserType>>, message) => {
                const { msgId } = message
                if (msgId) acc[msgId] = message.emojis ?? []
                return acc
            },
            {}
        )
        const payload: EventCheckMissingType = {
            msgIds: receivedMsgs,
        }

        if (d.enabled) d('CHECK_MISSING', payload)
        socket.emit(CHECK_MISSING, payload)
    }
}

let notifyTimeout: NodeJS.Timeout

export const notifyUserOnline = (username: string, room: string) => {
    if (!socket || !username || !room) return
    clearTimeout(notifyTimeout)
    const payload: EventUserOnlineType = { username, room }
    socket.emit(USER_ONLINE, payload)
    notifyTimeout = setTimeout(() => notifyUserOnline(username, room), MINUTE)
}

export const disconnect = () => {
    socket?.close()
}
