import { disconnect } from '../services/communication'
import { PartialMessageType } from '../types/ChatTypes'

export const saveLoginInfo = (login: string, room: string) => {
    localStorage.setItem('login', login)
    localStorage.setItem('room', room)
    window.history.pushState({}, `Chat in "${room}"`, `?room=${room}`)
}

export const removeLoginInfoAndGoBackToHome = (room: string) => {
    localStorage.removeItem('login')
    window.history.pushState({}, 'Chat', `./?room=${room}`)
    disconnect()
    window.location.reload()
}

export const sortMessages = (
    { timestamp: ts1 }: PartialMessageType,
    { timestamp: ts2 }: PartialMessageType
) => (ts1 ?? 0) - (ts2 ?? 0)
