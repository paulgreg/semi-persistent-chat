import React, { useEffect, useRef } from 'react'
import './Messages.css'
import Message from './Message'

const dateOptions = {
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
}

const isUserOnlineFromUsers = (users) => (user) =>
    users.findIndex((entry) => entry === user) !== -1

export default function Messages(props) {
    const { login, messages, users } = props
    const divRef = useRef()

    const isUserOnline = isUserOnlineFromUsers(users)

    useEffect(() => {
        if (divRef.current)
            divRef.current.scrollTop = divRef.current.scrollHeight
    })

    return (
        login && (
            <div className="Messages" ref={divRef}>
                {messages
                    .sort(({ timestamp: ts1 }, { timestamp: ts2 }) => ts1 - ts2)
                    .map(({ uuid, timestamp, user, message, validated }) => {
                        const statusClassName = validated
                            ? 'MessagesCheck'
                            : 'MessagesPending'
                        const statusSign = validated ? '✔' : '~'
                        const userStatus = isUserOnline(user)
                            ? 'online'
                            : 'offline'
                        return (
                            <div key={uuid} className="MessagesRow">
                                <span className="MessagesTime">
                                    {new Date(timestamp).toLocaleString(
                                        navigator.language,
                                        dateOptions
                                    )}
                                </span>
                                <span
                                    className={`MessagesUser ${
                                        user === login ? 'MessageSameUser' : ''
                                    }`}
                                >
                                    {user}
                                    {login !== user && (
                                        <span
                                            className={`UserStatus ${userStatus}`}
                                            title={userStatus}
                                        >
                                            •
                                        </span>
                                    )}{' '}
                                    :
                                </span>
                                <Message message={message} login={login} />
                                <span
                                    className={`MessagesStatus ${statusClassName}`}
                                >
                                    {statusSign}
                                </span>
                                <span className="MessagesUuid">{uuid}</span>
                            </div>
                        )
                    })}
            </div>
        )
    )
}
