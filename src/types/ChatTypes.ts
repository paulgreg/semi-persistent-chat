import type { Socket } from 'socket.io'

export type UserType = {
    userId: string
    username: string
}
export type UsersType = Array<UserType>

export type EmojiUserType = {
    username: string
    emoji: string
}

export type PartialMessageType = {
    msgId?: string
    text: string
    username: string
    room: string
    emojis?: Array<EmojiUserType>
    timestamp?: number
    validated?: boolean
    replyToId?: string
}

export type FullMessageType = {
    msgId: string
    text: string
    emojis: Array<EmojiUserType>
    username: string
    room: string
    timestamp: number
    validated: boolean
    replyToId?: string
}

export type EventUserOnlineType = {
    userId: string
    username: string
    room: string
}

export type EventIncomingMessageType = {
    message: PartialMessageType
}

export type EventDeleteType = {
    msgId: string
}

export type EventCheckMissingType = {
    msgIds: Record<string, EmojiUserType[]>
}

export type EventInitialMessagesType = {
    initialMessages: Array<FullMessageType>
}

export type EventUsersOnlineType = {
    users: UsersType
}

export type EventPushType = {
    message: FullMessageType
}

export type ServerUserType = {
    userId: string
    username: string
    room: string
    timestamp: number
    s: Socket
}
