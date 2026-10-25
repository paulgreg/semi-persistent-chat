import { useState, useEffect, useRef } from 'react'
import WriteBox from './components/WriteBox'
import MessagesList from './components/MessagesList'
import UsersList from './components/UsersList'
import { v1 as uuidV1 } from 'uuid'
import {
    sendMessage,
    onIncomingMessage,
    getInitialMessages,
    checkMissingMessages,
    notifyUserOnline,
    onUsersOnline,
    connect,
    onConnect,
    onDisconnect,
    sendDelete,
    onDeleteMessage,
} from './services/communication'
import mergeMessages from './services/mergeMessages'
import {
    useEffectOnVisible,
    isDocumentVisible,
} from './services/useEffectOnVisibilityChange'
import { arrayEquals } from './array'
import Home from './components/Home'
import Connecting from './components/Connecting'
import Warning from './components/Warning'
import Favicon from 'react-favicon'
import useEffectOnNetworkOnline from './services/useEffectOnNetworkOnline'
import debug from 'debug'
import {
    FullMessageType,
    PartialMessageType,
    UsersType,
} from './types/ChatTypes'
import { onEmojisType } from './components/MessageEmojis'
import { getSharedTextFromLocation, getUserId } from './services/utils'
import { isDataUrlImg } from './media'
import { decryptText, encryptText, isEncrypted } from './services/crypto'
import { clientConfig } from './services/clientConfig'
import logo192 from './assets/logo192.png'
import './Global.css'
import s from './App.module.css'

const d = debug('App')

export type onLoginType = (
    userId: string,
    login: string,
    room: string,
    password: string
) => void
export type setEditMessageType = (m: FullMessageType | undefined) => void
export type onDeleteType = (msgId: string) => void
export type onMessageCbType = (m: PartialMessageType) => void
export type onReplyType = (msgId: string) => void

globalThis.onpopstate = () => globalThis.location.reload()

const userId = getUserId()

const UNDECRYPTABLE_TEXT = '🔒 [encrypted message — wrong or missing password]'

const decryptMessage = async (
    m: FullMessageType,
    password: string
): Promise<FullMessageType> => {
    if (!isEncrypted(m.text)) return m
    if (!password) {
        return {
            ...m,
            text: UNDECRYPTABLE_TEXT,
            wasEncrypted: true,
            decryptFailed: true,
        }
    }
    try {
        return {
            ...m,
            text: await decryptText(password, m.text),
            wasEncrypted: true,
        }
    } catch (e) {
        d('decryption failed', e)
        return {
            ...m,
            text: UNDECRYPTABLE_TEXT,
            wasEncrypted: true,
            decryptFailed: true,
        }
    }
}

const App = () => {
    const [connected, setConnected] = useState(false)
    const [login, setLogin] = useState('')
    const [room, setRoom] = useState('')
    const [password, setPassword] = useState('')
    const [sendWarning, setSendWarning] = useState<string | undefined>()
    const passwordRef = useRef('')
    const [count, setCount] = useState(0)
    const [messages, setMessages] = useState<Array<FullMessageType>>([])
    const [editMessage, setEditMessage] = useState<
        FullMessageType | undefined
    >()
    const [users, setUsers] = useState<UsersType>([])
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [sharedMessage] = useState<string | undefined>(() =>
        getSharedTextFromLocation(globalThis.location)
    )

    // When editing a reply message, set the replyingTo state to preserve the reply relationship
    useEffect(() => {
        if (editMessage?.replyToId) {
            setReplyingTo(editMessage.replyToId)
        } else if (!editMessage) {
            // Reset replyingTo when not editing anymore
            setReplyingTo(null)
        }
    }, [editMessage])

    const getReplyPreview = (msgId: string | null) => {
        if (!msgId) return undefined
        const original = messages.find((m) => m.msgId === msgId)
        if (!original) return undefined
        if (isDataUrlImg(original.text)) return 'Image'
        const text = original.text.replaceAll(/\s+/g, ' ').trim()
        if (!text) return undefined
        return text.length > 50 ? `${text.slice(0, 50)}...` : text
    }

    const replyPreview = getReplyPreview(replyingTo)

    const onLogin: onLoginType = (userId, login, room, password) => {
        setLogin(login)
        setRoom(room)
        setPassword(password)
        passwordRef.current = password
        onConnect(() => setConnected(true))
        onDisconnect(() => setConnected(false))
        connect({ userId, username: login, room })
        getInitialMessages().then(async (initialMessages) => {
            const decrypted = await Promise.all(
                initialMessages.map((m) =>
                    decryptMessage(m, passwordRef.current)
                )
            )
            setMessages(decrypted)
        })
    }

    useEffect(() => {
        onIncomingMessage((incomingMessage) => {
            if (d.enabled) d('onIncomingMessage', incomingMessage)
            void decryptMessage(incomingMessage, passwordRef.current).then(
                (decrypted) => {
                    if (!isDocumentVisible()) setCount((count) => count + 1)
                    setMessages((msgs) => mergeMessages(msgs, [decrypted]))
                }
            )
        })
        onDeleteMessage((msgId) => {
            setMessages((msgs) => msgs.filter((m) => m.msgId !== msgId))
        })
    }, [setMessages, setCount])

    useEffectOnNetworkOnline(checkMissingMessages, messages)
    useEffectOnVisible(checkMissingMessages, messages)
    useEffectOnVisible(() => setCount(0), setCount)
    useEffectOnVisible(() => {
        if (userId && login && room) {
            notifyUserOnline({ userId, username: login, room })
        }
    }, [userId, login, room])

    useEffect(() => {
        onUsersOnline((newUsers) => {
            if (!arrayEquals(users, newUsers)) setUsers(newUsers)
        })
    }, [users, setUsers, login, room])

    // Encrypt with the room password (if any) before sending. The local state
    // keeps the clear text: the message echoed back by the server (encrypted)
    // is decrypted then merged back by msgId.
    const sendEncrypted = async (m: FullMessageType) => {
        setSendWarning(undefined)
        const pwd = passwordRef.current
        if (!pwd) {
            sendMessage(m)
            return
        }
        try {
            const encryptedText = await encryptText(pwd, m.text)
            if (encryptedText.length > clientConfig.maxMsgSize) {
                setSendWarning(
                    `Encrypted message is above the server size limit (${clientConfig.maxMsgSize}) — not sent`
                )
                return
            }
            sendMessage({ ...m, text: encryptedText })
        } catch (e) {
            d('encryption failed', e)
            setSendWarning('Encryption failed — message not sent')
        }
    }

    const onMessage: onMessageCbType = ({
        msgId,
        text,
        timestamp,
        emojis,
        version,
        replyToId,
    }) => {
        const m: FullMessageType = {
            msgId: msgId ?? uuidV1(),
            timestamp: timestamp ?? Date.now(),
            username: login,
            room,
            text,
            validated: false,
            emojis: emojis ?? [],
            replyToId: replyToId || replyingTo || undefined,
            version: version ?? 0,
            // displayed locally in clear text, but sent encrypted (if a
            // password is set): the encrypted echo from the server merges
            // back by msgId
            wasEncrypted: !!passwordRef.current,
        }
        setEditMessage(undefined)
        void sendEncrypted(m)
        setMessages((msgs) => mergeMessages(msgs, [m]))

        // Reset reply state after sending
        if (replyingTo) {
            setReplyingTo(null)
        }
    }

    const onEmojis: onEmojisType = ({ msgId, emojis }) => {
        const newMessage = messages.find((m) => m.msgId === msgId)
        if (newMessage) {
            // Never push updates on a message we could not decrypt: the whole
            // message (including its text) is re-sent and would overwrite the
            // original ciphertext with the placeholder
            if (newMessage.decryptFailed) return
            newMessage.emojis = emojis
            setMessages((msgs) =>
                msgs.map((m) => (m.msgId === msgId ? newMessage : m))
            )
            void sendEncrypted(newMessage)
        }
    }

    const onDelete = (msgId: string) => {
        sendDelete(msgId)
    }

    const onReply = (msgId: string) => {
        setReplyingTo(msgId)
    }

    const onCancelReply = () => {
        setReplyingTo(null)
    }

    const ready = login && room

    return (
        <div className={s.App}>
            <Favicon url={logo192} alertCount={count} />
            {!ready && <Home userId={userId} onLogin={onLogin} />}
            {ready && (
                <>
                    {!connected && <Connecting />}
                    {sendWarning && <Warning text={sendWarning} />}
                    <MessagesList
                        login={login}
                        users={users}
                        messages={messages}
                        editMsgId={editMessage?.msgId}
                        setEditMessage={setEditMessage}
                        onEmojis={onEmojis}
                        onDelete={onDelete}
                        onReply={onReply}
                    />
                    <WriteBox
                        login={login}
                        room={room}
                        password={password}
                        onMessage={onMessage}
                        editMessage={editMessage}
                        setEditMessage={setEditMessage}
                        initialMessage={sharedMessage}
                        replyingTo={replyingTo}
                        replyPreview={replyPreview}
                        onCancelReply={onCancelReply}
                    />
                    <UsersList userId={userId} users={users} room={room} />
                </>
            )}
        </div>
    )
}

export default App
