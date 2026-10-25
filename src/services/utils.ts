import { v1 as uuidV1 } from 'uuid'
import { disconnect } from '../services/communication'
import { PartialMessageType } from '../types/ChatTypes'

export const saveLoginInfo = (
    login: string,
    room: string,
    password?: string
) => {
    localStorage.setItem('spChatLogin', login)
    localStorage.setItem('spChatRoom', room)
    // The password deliberately lives only in the URL fragment: fragments are
    // never sent to the server and survive page reloads. pushState drops the
    // fragment if it is not repeated, so it has to be set explicitly here.
    const fragment = password ? `#pwd=${encodeURIComponent(password)}` : ''
    globalThis.history.pushState(
        {},
        `Chat in "${room}"`,
        `?room=${room}${fragment}`
    )
}

export const removeLoginInfoAndGoBackToHome = (room: string) => {
    localStorage.removeItem('spChatLogin')
    // A query-only pushState drops the fragment, removing the password from
    // the URL on logout
    globalThis.history.pushState({}, 'Chat', `./?room=${room}`)
    disconnect()
    globalThis.location.reload()
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

export const getSharedTextFromLocation = (location: Location) => {
    const params = new URLSearchParams(location.search)
    const title = params.get('title')?.trim()
    const text = params.get('text')?.trim()
    const url = params.get('url')?.trim()

    const sharedText = [title, text, url].filter(Boolean).join(' ').trim()
    return sharedText || undefined
}

export const getPasswordFromLocation = (location: Location) => {
    const hash = location.hash.replace(/^#/, '')
    if (!hash) return undefined
    const pwd = new URLSearchParams(hash).get('pwd')
    return pwd?.trim() || undefined
}
