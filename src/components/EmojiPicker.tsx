import { useCallback, useState } from 'react'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import s from './EmojiPicker.module.css'

export type EmojiPickerType = { native: string }

export type selectEmojiPickerType = (emoji?: EmojiPickerType) => void

type onSelectEmojiPickerType = {
    onSelectEmoji: selectEmojiPickerType
}
const EmojiPicker: React.FC<onSelectEmojiPickerType> = ({ onSelectEmoji }) => {
    const [open, setOpen] = useState(false)

    const onSelect = useCallback(
        (emoji: EmojiPickerType) => {
            setOpen(false)
            onSelectEmoji(emoji)
        },
        [setOpen, onSelectEmoji]
    )

    const onClickOutside = useCallback(() => {
        setOpen(false)
    }, [])

    const onClick = useCallback(() => {
        if (open) onSelectEmoji()
        setOpen(!open)
    }, [open, setOpen, onSelectEmoji])

    return (
        <>
            <button type="button" onClick={onClick} className={s.emojiButton}>
                <span role="img" aria-label="Emoji picker">
                    😀
                </span>
            </button>
            <div
                className={s.emojiPicker}
                style={{ display: open ? 'block' : 'none' }}
            >
                <Picker
                    data={data}
                    onEmojiSelect={onSelect}
                    onClickOutside={open ? onClickOutside : undefined}
                    set="native"
                    theme="dark"
                />
            </div>
        </>
    )
}

export default EmojiPicker
