import React, { useCallback } from 'react'
import Link from './Link'
import Linkify from 'react-linkify'
import { isDataUrlImg } from '../media'
import { checkText } from 'smile2emoji'
import MessageEmojis from './MessageEmojis'

const dateOptions = {
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
}
const timeOptions = {
    hour: 'numeric',
    minute: 'numeric',
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
    emojis,
    isUserOnline,
    setEditMessage,
    onEmojis,
    onDelete,
}) {
    if (isDataUrlImg(message))
        return (
            <details open>
                <summary>Image</summary>
                <img className="preview" src={message} alt="" />
            </details>
        )

    const messageWithEjomi = checkText(message)

    const sameUser = user === login
    const userStatus = isUserOnline(user) ? 'online' : 'offline'
    const d = new Date(timestamp)

    const onEditClick = useCallback(
        (e) => {
            e.stopPropagation()
            setEditMessage({ uuid, message, emojis })
        },
        [setEditMessage, uuid, message, emojis]
    )
    const onDeleteClick = useCallback(
        (e) => {
            e.stopPropagation()
            if (confirm('Delete ?')) onDelete({ uuid })
        },
        [uuid]
    )

    return (
        <div key={uuid} className="MessagesRow">
            <span
                className="MessagesTime"
                title={d.toLocaleString(navigator.language, dateOptions)}
            >
                {d.toLocaleString(navigator.language, timeOptions)}
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
            <MessageEmojis
                uuid={uuid}
                login={login}
                emojis={emojis}
                onEmojis={onEmojis}
            />
            {sameUser && (
                <span className="MessagesTextAction" onClick={onEditClick}>
                    ✏️
                </span>
            )}
            {sameUser && (
                <span className="MessagesTextAction" onClick={onDeleteClick}>
                    🗑️
                </span>
            )}
        </div>
    )
}
