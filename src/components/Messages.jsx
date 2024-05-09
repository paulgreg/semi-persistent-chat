import React, { useRef, useEffect } from 'react'
import Message from './Message'
import './Messages.css'

const isUserOnlineFromUsers = (users) => (user) =>
    users.findIndex((entry) => entry === user) !== -1

export default function Messages({ login, messages, users, setEditMessage }) {
    const messagesRef = useRef()

    const isUserOnline = isUserOnlineFromUsers(users)

    useEffect(() => {
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight
        }
    }, [messagesRef, messages])

    return (
        login && (
            <div className="Messages" ref={messagesRef}>
                {messages
                    .sort(({ timestamp: ts1 }, { timestamp: ts2 }) => ts1 - ts2)
                    .map(({ uuid, timestamp, user, message, validated }) => {
                        return (
                            <Message
                                key={uuid}
                                login={login}
                                uuid={uuid}
                                message={message}
                                timestamp={timestamp}
                                user={user}
                                validated={validated}
                                isUserOnline={isUserOnline}
                                setEditMessage={setEditMessage}
                            />
                        )
                    })}
            </div>
        )
    )
}
