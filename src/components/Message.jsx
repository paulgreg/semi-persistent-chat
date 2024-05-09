import React, { useCallback } from 'react'
import Link from './Link'
import Linkify from 'react-linkify'
import { isDataUrlImg } from '../media'
import { checkText } from 'smile2emoji'

const dateOptions = {
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
}

export const hightlightSameUser = ({ login, message }) =>
    new RegExp(`\\b(${login})\\b`, 'gi').test(message) ? (
        <span className="MessageSameUser">{message}</span>
    ) : (
        message
    )

export default function Message({
    login,
    uuid,
    user,
    message,
    timestamp,
    validated,
    isUserOnline,
    setEditMessage,
}) {
    if (isDataUrlImg(message))
        return (
            <details open>
                <summary>Image</summary>
                <img className="preview" src={message} alt="" />
            </details>
        )

    const messageWithEjomi = checkText(message)

    const statusClassName = validated ? 'MessagesCheck' : 'MessagesPending'
    const statusSign = validated ? '✔' : '~'
    const sameUser = user === login
    const userStatus = isUserOnline(user) ? 'online' : 'offline'

    const onEditClick = useCallback(
        (e) => {
            e.stopPropagation()
            setEditMessage({ uuid, message })
        },
        [setEditMessage, uuid, message]
    )

    return (
        <div key={uuid} className="MessagesRow">
            <span className="MessagesTime">
                {new Date(timestamp).toLocaleString(
                    navigator.language,
                    dateOptions
                )}
            </span>
            <span
                className={`MessagesUser ${sameUser ? 'MessageSameUser' : ''}`}
            >
                {user}
                {!sameUser && (
                    <span
                        className={`UserStatus ${userStatus}`}
                        title={userStatus}
                    >
                        •
                    </span>
                )}{' '}
                :
            </span>
            <span
                className={`MessagesText ${validated ? '' : 'MessagesTextPending'}`}
            >
                <Linkify componentDecorator={Link}>
                    {hightlightSameUser({ login, message: messageWithEjomi })}
                </Linkify>
            </span>
            <span
                className={`MessagesStatus ${statusClassName}`}
                title={validated ? 'sent' : 'pending'}
            >
                {statusSign}
            </span>
            {sameUser && (
                <span className="MessagesTextEdit" onClick={onEditClick}>
                    ✏️
                </span>
            )}
            <span className="MessagesUuid">{uuid}</span>
        </div>
    )
}
