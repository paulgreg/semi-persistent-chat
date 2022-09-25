import React from 'react'
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

    const isUserOnline = isUserOnlineFromUsers(users)

    return (
        login && (
            <div className="Messages">
                {messages
                    .sort(({ timestamp: ts1 }, { timestamp: ts2 }) => ts2 - ts1)
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
                                <Message
                                    message={message}
                                    login={login}
                                    validated={validated}
                                />
                                <span
                                    className={`MessagesStatus ${statusClassName}`}
                                    title={validated ? 'sent' : 'pending'}
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
