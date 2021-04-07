import React, { useCallback, useState } from 'react'
import { Picker } from 'emoji-mart'
import 'emoji-mart/css/emoji-mart.css'
import './EmojiPicker.css'

export function EmojiPicker({ style, onSelectEmoji }) {
    const [open, setOpen] = useState(false)

    const onSelect = useCallback(
        (emoji) => {
            setOpen(false)
            onSelectEmoji(emoji)
        },
        [setOpen, onSelectEmoji]
    )

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="emojiButton"
            >
                <span role="img" aria-label="Emoji picker">
                    😀
                </span>
            </button>
            <div className="emojiPicker">
                <Picker
                    onSelect={onSelect}
                    style={{ display: open ? 'block' : 'none' }}
                    enableFrequentEmojiSort={true}
                    showPreview={false}
                    native={true}
                    theme="dark"
                    title="Emoji"
                />
            </div>
        </>
    )
}
