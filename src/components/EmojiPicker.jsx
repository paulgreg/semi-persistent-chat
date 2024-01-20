import React, { useCallback, useState } from 'react'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import './EmojiPicker.css'

export function EmojiPicker({ onSelectEmoji }) {
    const [open, setOpen] = useState(false)

    const onSelect = useCallback(
        (emoji) => {
            setOpen(false)
            onSelectEmoji(emoji)
        },
        [setOpen, onSelectEmoji]
    )

    const onClick = useCallback(() => {
        if (open) onSelectEmoji()
        setOpen(!open)
    }, [open, setOpen, onSelectEmoji])

    return (
        <>
            <button type="button" onClick={onClick} className="emojiButton">
                <span role="img" aria-label="Emoji picker">
                    😀
                </span>
            </button>
            <div
                className="emojiPicker"
                style={{ display: open ? 'block' : 'none' }}
            >
                <Picker
                    data={data}
                    onEmojiSelect={onSelect}
                    set="native"
                    theme="dark"
                />
            </div>
        </>
    )
}
