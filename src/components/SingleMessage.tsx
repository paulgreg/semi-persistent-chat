import { MouseEvent, useCallback, useState, useEffect, useRef } from 'react'
import Link from './Link'
import Linkify from 'react-linkify'
import { isDataUrlImg } from '../media'
import { checkText } from 'smile2emoji'
import MessageEmojis, { onEmojisType } from './MessageEmojis'
import { FullMessageType } from '../types/ChatTypes'
import { onDeleteType, onReplyType, setEditMessageType } from '../App'
import { clientConfig } from '../services/clientConfig'
import { useEffectOnceOnVisibleAndFocus } from '../services/useEffectOnVisibilityChange'

const HIGHLIGHT_DELAY = 1_000

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
    editMsgId?: string
    setEditMessage: setEditMessageType
    onEmojis: onEmojisType
    onDelete: onDeleteType
    onReply: onReplyType
    isReply?: boolean
    replyCount?: number
}

export const hightlightSameUser = ({
    login,
    text,
}: {
    login: string
    text: string
}) =>
    new RegExp(String.raw`\b(${login})\b`, 'gi').test(text) ? (
        <span className="MessageSameUser">{text}</span>
    ) : (
        text
    )

const SingleMessage: React.FC<MessageComponentType> = ({
    login,
    message,
    isUserOnline,
    editMsgId,
    setEditMessage,
    onEmojis,
    onDelete,
    onReply,
    isReply = false,
    replyCount = 0,
}) => {
    const { msgId, text, emojis, username, timestamp, validated, version } =
        message
    const [isExpired, setIsExpired] = useState(false)
    const [isHighlight, setIsHighlight] = useState(true)
    const elRef = useRef<HTMLDivElement>(null)

    const onEditClick = useCallback(
        (e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation()
            setEditMessage(message)
        },
        [setEditMessage, message]
    )
    const onDeleteClick = useCallback(
        (e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation()
            if (msgId && confirm('Delete ?')) onDelete(msgId)
        },
        [onDelete, msgId]
    )

    const checkExpiration = useCallback(() => {
        const expirationTime =
            timestamp + clientConfig.messageRetentionHours * 60 * 60 * 1000
        const isMessageExpired = Date.now() > expirationTime

        if (isMessageExpired && !isExpired) {
            setIsExpired(true)
            return
        }

        if (!isMessageExpired && !isExpired) {
            setTimeout(checkExpiration, 600000)
        }
    }, [timestamp, isExpired])

    useEffect(() => {
        checkExpiration()
    }, [checkExpiration])

    useEffect(() => {
        if (version > 1) setIsHighlight(true)
    }, [version])

    useEffectOnceOnVisibleAndFocus(() => {
        const removeHighlightClass = () => setIsHighlight(false)

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setTimeout(removeHighlightClass, HIGHLIGHT_DELAY)
                        observer.unobserve(entry.target) // stop watching once seen
                    }
                })
            },
            {
                threshold: 1,
            }
        )
        const el = elRef.current
        if (el) {
            observer.observe(el)
            return () => observer.unobserve(el)
        }
    }, [elRef])

    const d = new Date(timestamp)
    const sameUser = login === username
    const userStatus = isUserOnline(username) ? 'online' : 'offline'
    const canReply = !isReply
    const classEdition = msgId === editMsgId ? 'MessageEdition' : ''
    const classReply = isReply ? 'MessageReply' : ''
    const classHighlight = isHighlight ? 'MessagesRowHighlight' : ''

    if (isDataUrlImg(text))
        return (
            <div
                key={msgId}
                ref={elRef}
                className={`MessagesRow ${classHighlight}`}
            >
                <span
                    className="MessagesTime"
                    title={d.toLocaleDateString(
                        navigator.language,
                        dateOptions
                    )}
                >
                    {d.toLocaleTimeString(navigator.language, timeOptions)}
                </span>
                <span
                    className={`MessagesUser ${sameUser ? 'MessageSameUser' : ''}`}
                    title={`message version: ${version}`}
                >
                    {message.username}
                    {!sameUser && (
                        <span
                            className={`UserStatus ${userStatus}`}
                            title={userStatus}
                        >
                            •
                        </span>
                    )}
                </span>
                <details open>
                    <summary>Image</summary>
                    <img className="preview" src={text} alt="" />
                    <MessageEmojis
                        msgId={msgId}
                        login={login}
                        emojis={emojis}
                        onEmojis={onEmojis}
                    />
                    {sameUser && (
                        <button
                            className="MessagesTextAction"
                            type="button"
                            aria-label="Delete message"
                            onClick={onDeleteClick}
                        >
                            🗑️
                        </button>
                    )}
                </details>
            </div>
        )

    return (
        <div
            key={msgId}
            ref={elRef}
            className={`MessagesRow ${classEdition} ${classReply} ${classHighlight}`}
        >
            <span
                className="MessagesTime"
                title={d.toLocaleDateString(navigator.language, dateOptions)}
            >
                {d.toLocaleTimeString(navigator.language, timeOptions)}
            </span>
            <span
                className={`MessagesUser ${sameUser ? 'MessageSameUser' : ''}`}
                title={`message version: ${version}`}
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
                {!isReply && replyCount > 0 && (
                    <span className="MessageReplyCount" title="Replies">
                        💬 {replyCount}
                    </span>
                )}
            </span>
            <span
                className={`MessagesText ${validated ? '' : 'MessagesTextPending'} ${isExpired ? 'MessagesTextExpired' : ''}`}
            >
                <Linkify componentDecorator={Link}>
                    {hightlightSameUser({ login, text: checkText(text) })}
                </Linkify>
            </span>
            <MessageEmojis
                msgId={msgId}
                login={login}
                emojis={emojis}
                onEmojis={onEmojis}
            />
            {canReply && (
                <button
                    className="MessagesTextAction"
                    type="button"
                    aria-label="Reply"
                    onClick={() => onReply(message.msgId)}
                >
                    💬
                </button>
            )}
            {sameUser && (
                <button
                    className="MessagesTextAction"
                    type="button"
                    aria-label="Edit message"
                    onClick={onEditClick}
                >
                    ✏️
                </button>
            )}
            {sameUser && (
                <button
                    className="MessagesTextAction"
                    type="button"
                    aria-label="Delete message"
                    onClick={onDeleteClick}
                >
                    🗑️
                </button>
            )}
        </div>
    )
}

export default SingleMessage
