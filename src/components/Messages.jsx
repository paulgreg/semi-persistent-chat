import React, { useState, useRef, useEffect } from 'react'
import Message from './Message'
import './Messages.css'

const isUserOnlineFromUsers = (users) => (user) =>
    users.findIndex((entry) => entry === user) !== -1

export default function Messages({
    login,
    messages,
    users,
    setEditMessage,
    onEmojis,
}) {
    const messagesRef = useRef()
    const [count, setCount] = useState(messages?.length)

    const isUserOnline = isUserOnlineFromUsers(users)

    useEffect(() => {
        if (messagesRef.current && messages?.length > count) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight
            setCount(messages.length)
        }
    }, [messagesRef, messages])

    return (
        login && (
            <div className="Messages" ref={messagesRef}>
                {messages
                    .sort(({ timestamp: ts1 }, { timestamp: ts2 }) => ts1 - ts2)
                    .map(
                        ({
                            uuid,
                            timestamp,
                            user,
                            message,
                            validated,
                            emojis,
                        }) => {
                            return (
                                <Message
                                    key={uuid}
                                    login={login}
                                    uuid={uuid}
                                    message={message}
                                    timestamp={timestamp}
                                    user={user}
                                    validated={validated}
                                    emojis={emojis}
                                    isUserOnline={isUserOnline}
                                    setEditMessage={setEditMessage}
                                    onEmojis={onEmojis}
                                />
                            )
                        }
                    )}
            </div>
        )
    )
}
