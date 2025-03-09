import React, { useState, useRef, useEffect, useCallback } from 'react'
import MessageComponent from './MessageComponent'
import { FullMessageType, UsersType } from '../types/ChatTypes'
import { onEmojisType } from './MessageEmojis'
import { onDeleteType, setEditMessageType } from '../App'
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
}

const MessagesList: React.FC<MessagesListType> = ({
    login,
    messages,
    users,
    editMsgId,
    setEditMessage,
    onEmojis,
    onDelete,
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

    return (
        <div className="Messages" ref={messagesRef}>
            {messages.toSorted(sortMessages).map((message) => (
                <MessageComponent
                    key={message.msgId}
                    login={login}
                    message={message}
                    isUserOnline={isUserOnline}
                    editMsgId={editMsgId}
                    setEditMessage={setEditMessage}
                    onEmojis={onEmojis}
                    onDelete={onDelete}
                />
            ))}
        </div>
    )
}

export default MessagesList
