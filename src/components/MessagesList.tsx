import React, { useState, useRef, useEffect, useCallback } from 'react'
import SingleMessage from './SingleMessage'
import { FullMessageType, UsersType } from '../types/ChatTypes'
import { onEmojisType } from './MessageEmojis'
import { onDeleteType, onReplyType, setEditMessageType } from '../App'
import { sortMessages } from '../services/utils'
import './MessagesList.css'

const isUserOnlineFromUsers = (users: UsersType) => (username: string) =>
    users.findIndex((user) => user.username === username) !== -1

type MessagesListType = {
    login: string
    messages: Array<FullMessageType>
    users: UsersType
    editMsgId?: string
    setEditMessage: setEditMessageType
    onEmojis: onEmojisType
    onDelete: onDeleteType
    onReply: onReplyType
}

const MessagesList: React.FC<MessagesListType> = ({
    login,
    messages,
    users,
    editMsgId,
    setEditMessage,
    onEmojis,
    onDelete,
    onReply,
}) => {
    const messagesRef = useRef<HTMLDivElement>(null)
    const [count, setCount] = useState(messages?.length)

    const isUserOnline = useCallback(
        (username: string) => isUserOnlineFromUsers(users)(username),
        [users]
    )

    useEffect(() => {
        if (messagesRef.current && messages?.length > count) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight
            setCount(messages.length)
        }
    }, [messagesRef, messages, count])

    const topLevelMessages = messages
        .filter((message) => !message.replyToId)
        .toSorted(sortMessages)

    const repliesByParent = messages.reduce(
        (acc: Record<string, Array<FullMessageType>>, message) => {
            if (message.replyToId) {
                if (!acc[message.replyToId]) acc[message.replyToId] = []
                acc[message.replyToId].push(message)
            }
            return acc
        },
        {}
    )

    Object.values(repliesByParent).forEach((replies) =>
        replies.sort(sortMessages)
    )

    return (
        <div className="Messages" ref={messagesRef}>
            {topLevelMessages.map((message) => {
                const replies = repliesByParent[message.msgId] ?? []
                return (
                    <div key={message.msgId} className="MessageGroup">
                        <SingleMessage
                            login={login}
                            message={message}
                            isUserOnline={isUserOnline}
                            editMsgId={editMsgId}
                            setEditMessage={setEditMessage}
                            onEmojis={onEmojis}
                            onDelete={onDelete}
                            onReply={onReply}
                            replyCount={replies.length}
                        />
                        {replies.length > 0 && (
                            <div className="MessageReplies">
                                {replies.map((reply) => (
                                    <SingleMessage
                                        key={reply.msgId}
                                        login={login}
                                        message={reply}
                                        isUserOnline={isUserOnline}
                                        editMsgId={editMsgId}
                                        setEditMessage={setEditMessage}
                                        onEmojis={onEmojis}
                                        onDelete={onDelete}
                                        onReply={onReply}
                                        isReply
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default MessagesList
