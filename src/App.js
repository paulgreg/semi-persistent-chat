import React, { useState, useEffect } from 'react'
import './Global.css'
import './App.css'
import WriteBox from './components/WriteBox'
import Messages from './components/Messages'
import Users from './components/Users'
import uuid from 'uuid/v1'
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
} from './services/communication'
import mergeMessages from './services/mergeMessages'
import useEffectOnVisibilityChange, {
    isDocumentVisible,
} from './services/useEffectOnVisibilityChange'
import Favicon from 'react-favicon'
import logo512 from './logo512.png'
import { arrayEquals } from './array'
import Home from './components/Home'
import Connecting from './components/Connecting'

window.onpopstate = () => window.location.reload(false)

function App() {
    const [connected, setConnected] = useState(false)
    const [login, setLogin] = useState('')
    const [room, setRoom] = useState('')
    const [count, setCount] = useState(0)
    const [messages, setMessages] = useState([])
    const [users, setUsers] = useState([])

    const onLogin = (login, room) => {
        setLogin(login)
        setRoom(room)
        onConnect(() => setConnected(true))
        onDisconnect(() => setConnected(false))
        connect(login, room)
        getInitialMessages().then((initialMessages) => {
            setMessages(mergeMessages(messages, initialMessages))
        })
    }

    useEffect(() => {
        onIncomingMessage((incomingMessage) => {
            if (!isDocumentVisible()) setCount(count + 1)
            setMessages(mergeMessages(messages, incomingMessage))
        })
    }, [messages, setMessages, count, setCount])

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

    const onMessage = (text) => {
        const m = {
            uuid: uuid(),
            timestamp: Date.now(),
            user: login,
            message: text,
            validated: false,
            room,
        }
        sendMessage(m)
        setMessages(mergeMessages(messages, m))
    }

    const ready = login && room
    return (
        <div className="App">
            {!ready && <Home onLogin={onLogin} />}
            {ready && (
                <div className="chat">
                    {!connected && <Connecting />}
                    {connected && (
                        <>
                            <Favicon url={logo512} alertCount={count} />
                            <Users login={login} users={users} />
                            <WriteBox login={login} onMessage={onMessage} />
                            <Messages
                                login={login}
                                users={users}
                                messages={messages}
                            />
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default App
