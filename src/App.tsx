import { useState, useEffect } from 'react'
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
import useEffectOnVisibilityChange, {
    isDocumentVisible,
} from './services/useEffectOnVisibilityChange'
import { arrayEquals } from './array'
import Home from './components/Home'
import Connecting from './components/Connecting'
import Favicon from 'react-favicon'
import useEffectOnNetworkOnline from './services/useEffectOnNetworkOnline'
import debug from 'debug'
import {
    FullMessageType,
    PartialMessageType,
    UsersType,
} from './types/ChatTypes'
import { onEmojisType } from './components/MessageEmojis'
import { getUserId } from './services/utils'
import logo192 from './logo192.png'
import './Global.css'
import './App.css'

const d = debug('App')

export type onLoginType = (userId: string, login: string, room: string) => void
export type setEditMessageType = (m: FullMessageType | undefined) => void
export type onDeleteType = (msgId: string) => void
export type onMessageCbType = (m: PartialMessageType) => void

window.onpopstate = () => window.location.reload()

const userId = getUserId()

const App = () => {
    const [connected, setConnected] = useState(false)
    const [login, setLogin] = useState('')
    const [room, setRoom] = useState('')
    const [count, setCount] = useState(0)
    const [messages, setMessages] = useState<Array<FullMessageType>>([])
    const [editMessage, setEditMessage] = useState<
        FullMessageType | undefined
    >()
    const [users, setUsers] = useState<UsersType>([])

    const onLogin: onLoginType = (userId, login, room) => {
        setLogin(login)
        setRoom(room)
        onConnect(() => setConnected(true))
        onDisconnect(() => setConnected(false))
        connect({ userId, username: login, room })
        getInitialMessages().then((initialMessages) => {
            setMessages(initialMessages)
        })
    }

    useEffect(() => {
        onIncomingMessage((incomingMessage) => {
            if (d.enabled) d('onIncomingMessage', incomingMessage)
            if (!isDocumentVisible()) setCount((count) => count + 1)
            setMessages((msgs) => mergeMessages(msgs, [incomingMessage]))
        })
        onDeleteMessage((msgId) => {
            setMessages((msgs) => msgs.filter((m) => m.msgId !== msgId))
        })
    }, [setMessages, setCount])

    useEffectOnNetworkOnline(checkMissingMessages, messages)
    useEffectOnVisibilityChange(checkMissingMessages, messages)
    useEffectOnVisibilityChange(() => setCount(0), setCount)
    useEffectOnVisibilityChange(() => {
        if (userId && login && room) {
            notifyUserOnline({ userId, username: login, room })
        }
    }, [userId, login, room])

    useEffect(() => {
        onUsersOnline((newUsers) => {
            if (!arrayEquals(users, newUsers)) setUsers(newUsers)
        })
    }, [users, setUsers, login, room])

    const onMessage: onMessageCbType = ({ msgId, text, timestamp, emojis }) => {
        const m: FullMessageType = {
            msgId: msgId ?? uuidV1(),
            timestamp: timestamp ?? Date.now(),
            username: login,
            room,
            text,
            validated: false,
            emojis: emojis ?? [],
        }
        setEditMessage(undefined)
        sendMessage(m)
        setMessages((msgs) => mergeMessages(msgs, [m]))
    }

    const onEmojis: onEmojisType = ({ msgId, emojis }) => {
        const newMessage = messages.find((m) => m.msgId === msgId)
        if (newMessage) {
            newMessage.emojis = emojis
            setMessages((msgs) =>
                msgs.map((m) => (m.msgId === msgId ? newMessage : m))
            )
            sendMessage(newMessage)
        }
    }

    const onDelete = (msgId: string) => {
        sendDelete(msgId)
    }

    const ready = login && room

    return (
        <div className="App">
            {!ready && <Home userId={userId} onLogin={onLogin} />}
            {ready && (
                <>
                    {!connected && <Connecting />}
                    <Favicon url={logo192} alertCount={count} />
                    <MessagesList
                        login={login}
                        users={users}
                        messages={messages}
                        editMsgId={editMessage?.msgId}
                        setEditMessage={setEditMessage}
                        onEmojis={onEmojis}
                        onDelete={onDelete}
                    />
                    <WriteBox
                        login={login}
                        room={room}
                        onMessage={onMessage}
                        editMessage={editMessage}
                        setEditMessage={setEditMessage}
                    />
                    <UsersList userId={userId} users={users} room={room} />
                </>
            )}
        </div>
    )
}

export default App
