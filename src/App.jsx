import React, { useState, useEffect, useCallback } from 'react'
import './Global.css'
import './App.css'
import WriteBox from './components/WriteBox'
import Messages from './components/Messages'
import Users from './components/Users'
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
import logo192 from './logo192.png'
import { arrayEquals } from './array'
import Home from './components/Home'
import Connecting from './components/Connecting'
import Favicon from './components/Favicon'

window.onpopstate = () => window.location.reload()

function App() {
    const [connected, setConnected] = useState(false)
    const [login, setLogin] = useState('')
    const [room, setRoom] = useState('')
    const [count, setCount] = useState(0)
    const [messages, setMessages] = useState([])
    const [editMessage, setEditMessage] = useState()
    const [users, setUsers] = useState([])

    const onLogin = (login, room) => {
        setLogin(login)
        setRoom(room)
        onConnect(() => setConnected(true))
        onDisconnect(() => setConnected(false))
        connect(login, room)
        getInitialMessages().then((initialMessages) => {
            setMessages(initialMessages)
        })
    }

    useEffect(() => {
        onIncomingMessage((incomingMessage) => {
            if (!isDocumentVisible()) setCount((count) => count + 1)
            setMessages(mergeMessages(messages, [incomingMessage]))
        })
        onDeleteMessage((uuid) => {
            setMessages(messages.filter((m) => m.uuid !== uuid))
        })
    }, [messages, setMessages, setCount])

    useEffectOnVisibilityChange(checkMissingMessages, messages)
    useEffectOnVisibilityChange(() => setCount(0), setCount)
    useEffectOnVisibilityChange(
        () => login && room && notifyUserOnline(login, room),
        login,
        room
    )

    useEffect(() => {
        onUsersOnline((newUsers) => {
            if (!arrayEquals(users, newUsers)) setUsers(newUsers)
        })
    }, [users, setUsers])

    const onMessage = ({ uuid, text, timestamp, emojis }) => {
        const m = {
            uuid: uuid ?? uuidV1(),
            timestamp: timestamp ?? Date.now(),
            user: login,
            message: text,
            validated: false,
            room,
            emojis: emojis ?? [],
        }
        setEditMessage(undefined)
        sendMessage(m)
        setMessages(mergeMessages(messages, [m]))
    }

    const onEmojis = ({ uuid, emojis }) => {
        const newMessage = messages.find((m) => m.uuid === uuid)
        newMessage.emojis = emojis
        setMessages((messages) =>
            messages.map((m) => (m.uuid === uuid ? newMessage : m))
        )
        sendMessage(newMessage)
    }

    const onDelete = ({ uuid }) => {
        sendDelete(uuid)
    }

    const ready = login && room

    return (
        <div className="App">
            {!ready && <Home onLogin={onLogin} />}
            {ready && (
                <>
                    {!connected && <Connecting />}
                    <Messages
                        login={login}
                        users={users}
                        messages={messages}
                        setEditMessage={setEditMessage}
                        onEmojis={onEmojis}
                        onDelete={onDelete}
                    />
                    <WriteBox
                        login={login}
                        onMessage={onMessage}
                        editMessage={editMessage}
                        setEditMessage={setEditMessage}
                    />
                    <Favicon url={logo192} alertCount={count} />
                    <Users login={login} users={users} room={room} />
                </>
            )}
        </div>
    )
}

export default App
