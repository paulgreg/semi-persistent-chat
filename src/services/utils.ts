import { v1 as uuidV1 } from 'uuid'
import { disconnect } from '../services/communication'
import { PartialMessageType } from '../types/ChatTypes'

export const saveLoginInfo = (login: string, room: string) => {
    localStorage.setItem('spChatLogin', login)
    localStorage.setItem('spChatRoom', room)
    window.history.pushState({}, `Chat in "${room}"`, `?room=${room}`)
}

export const removeLoginInfoAndGoBackToHome = (room: string) => {
    localStorage.removeItem('spChatLogin')
    window.history.pushState({}, 'Chat', `./?room=${room}`)
    disconnect()
    window.location.reload()
}

export const sortMessages = (
    { timestamp: ts1 }: PartialMessageType,
    { timestamp: ts2 }: PartialMessageType
) => (ts1 ?? 0) - (ts2 ?? 0)

export const getUserId = () => {
    const userId = localStorage.getItem('spChatUserId')
    if (userId?.length) return userId

    const newUserId = uuidV1()
    localStorage.setItem('spChatUserId', newUserId)
    return newUserId
}
