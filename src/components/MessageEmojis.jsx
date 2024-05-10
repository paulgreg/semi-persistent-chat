import React, { useCallback, useState } from 'react'
import './MessageEmojis.css'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'

const MessageEmojis = ({ uuid, login, emojis = [], onEmojis }) => {
    const [open, setOpen] = useState(false)

    const onAddClick = useCallback((e) => {
        e.stopPropagation()
        setOpen(true)
    }, [])

    const onSelect = useCallback(
        (emoji) => {
            onEmojis({
                uuid,
                emojis: [...emojis, { user: login, emoji: emoji.native }],
            })
            setOpen(false)
        },
        [onEmojis]
    )
    const onRemoveClick = useCallback(
        (index) => (e) => {
            e.stopPropagation()
            onEmojis({
                uuid,
                emojis: emojis.filter((emoji, idx) => idx !== index),
            })
        },
        [onEmojis]
    )

    return (
        <div className="MessageEmojisRow">
            <span
                className={`MessageEmojis ${emojis.length === 0 ? 'MessageEmojisHidden' : ''}`}
            >
                {emojis.map((emoji, idx) => (
                    <span
                        className={`MessageEmoji ${login === emoji.user ? 'MessageEmojiSameUser' : ''} `}
                        title={emoji.user}
                        key={idx}
                        onClick={
                            login === emoji.user
                                ? onRemoveClick(idx)
                                : undefined
                        }
                    >
                        {emoji.emoji}
                    </span>
                ))}
                <span className="MessageEmojiAdd" onClick={onAddClick}>
                    ➕
                </span>
            </span>
            {open && (
                <div className="MessageEmojiPicker">
                    <Picker
                        data={data}
                        onEmojiSelect={onSelect}
                        set="native"
                        theme="dark"
                    />
                </div>
            )}
        </div>
    )
}

export default MessageEmojis