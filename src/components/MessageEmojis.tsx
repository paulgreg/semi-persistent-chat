import React, { MouseEvent, useCallback, useState } from 'react'
import './MessageEmojis.css'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import { EmojiUserType } from '../types/ChatTypes'
import { EmojiPickerType } from './EmojiPicker'

export type onEmojisType = (o: {
    msgId: string
    emojis: Array<EmojiUserType>
}) => void

type MessagesEmojis = {
    msgId: string
    login: string
    emojis: Array<EmojiUserType>
    onEmojis: (o: { msgId: string; emojis: Array<EmojiUserType> }) => void
}

const MessageEmojis: React.FC<MessagesEmojis> = ({
    msgId,
    login,
    emojis = [],
    onEmojis,
}) => {
    const [open, setOpen] = useState(false)

    const onAddClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        setOpen(true)
    }, [])

    const onClickOutside = useCallback(() => {
        setOpen(false)
    }, [])

    const onSelect = useCallback(
        (emoji: EmojiPickerType) => {
            onEmojis({
                msgId,
                emojis: [...emojis, { username: login, emoji: emoji.native }],
            })
            setOpen(false)
        },
        [emojis, login, msgId, onEmojis]
    )
    const onRemoveClick = useCallback(
        (index: number) => (e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation()
            onEmojis({
                msgId,
                emojis: emojis.filter((_, idx) => idx !== index),
            })
        },
        [emojis, msgId, onEmojis]
    )

    return (
        <div className="MessageEmojisRow">
            <span className="MessageEmojis">
                {emojis.map((emoji, idx) =>
                    login === emoji.username ? (
                        <button
                            className="MessageEmoji MessageEmojiButton MessageEmojiSameUser"
                            title={emoji.username}
                            type="button"
                            aria-label={`Remove ${emoji.emoji} reaction`}
                            key={idx}
                            onClick={onRemoveClick(idx)}
                        >
                            {emoji.emoji}
                        </button>
                    ) : (
                        <span
                            className="MessageEmoji"
                            title={emoji.username}
                            key={idx}
                        >
                            {emoji.emoji}
                        </span>
                    )
                )}
                <button
                    className="MessageEmojiAdd"
                    type="button"
                    aria-label="Add reaction"
                    onClick={onAddClick}
                >
                    ➕
                </button>
            </span>
            {open && (
                <div className="MessageEmojiPicker">
                    <Picker
                        data={data}
                        onEmojiSelect={onSelect}
                        onClickOutside={onClickOutside}
                        set="native"
                        theme="dark"
                    />
                </div>
            )}
        </div>
    )
}

export default MessageEmojis
