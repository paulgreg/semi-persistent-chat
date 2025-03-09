import { MouseEvent, useCallback } from 'react'
import Link from './Link'
import Linkify from 'react-linkify'
import { isDataUrlImg } from '../media'
import { checkText } from 'smile2emoji'
import MessageEmojis, { onEmojisType } from './MessageEmojis'
import { FullMessageType } from '../types/ChatTypes'
import { onDeleteType, setEditMessageType } from '../App'
import HightlightSameUser from './HighligtSameUser'

const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
}
const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
}

type MessageComponentType = {
    login: string
    message: FullMessageType
    isUserOnline: (username: string) => boolean
    setEditMessage: setEditMessageType
    onEmojis: onEmojisType
    onDelete: onDeleteType
}

const MessageComponent: React.FC<MessageComponentType> = ({
    login,
    message,
    isUserOnline,
    setEditMessage,
    onEmojis,
    onDelete,
}) => {
    const { msgId, text, emojis, username, timestamp, validated } = message

    const onEditClick = useCallback(
        (e: MouseEvent<HTMLSpanElement>) => {
            e.stopPropagation()
            setEditMessage(message)
        },
        [setEditMessage, message]
    )
    const onDeleteClick = useCallback(
        (e: MouseEvent<HTMLSpanElement>) => {
            e.stopPropagation()
            if (msgId && confirm('Delete ?')) onDelete(msgId)
        },
        [onDelete, msgId]
    )

    if (isDataUrlImg(text))
        return (
            <details open>
                <summary>Image</summary>
                <img className="preview" src={text} alt="" />
            </details>
        )

    const textWithEjomi = checkText(text)

    const sameUser = login === username
    const userStatus = isUserOnline(username) ? 'online' : 'offline'
    const d = new Date(timestamp ?? 0)

    return (
        <div key={msgId} className="MessagesRow">
            <span
                className="MessagesTime"
                title={d.toLocaleDateString(navigator.language, dateOptions)}
            >
                {d.toLocaleTimeString(navigator.language, timeOptions)}
            </span>
            <span
                className={`MessagesUser ${sameUser ? 'MessageSameUser' : ''}`}
            >
                {message.username}
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
                    <HightlightSameUser login={login} text={textWithEjomi} />
                </Linkify>
            </span>
            <MessageEmojis
                msgId={msgId}
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

export default MessageComponent
