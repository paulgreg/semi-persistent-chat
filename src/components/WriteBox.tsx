import React, {
    useRef,
    useEffect,
    useState,
    ChangeEvent,
    KeyboardEvent,
    MouseEvent,
    ClipboardEvent,
    useCallback,
} from 'react'
import { isDataUrlImg } from '../media'
import EmojiPicker, { selectEmojiPickerType } from './EmojiPicker'
import { insertAt } from './strings.ts'
import { useTemporaryWarning } from './temporaryWarning'
import useTimeout from './useTimeout'
import Warning from './Warning.tsx'
import settings from '../settings.json'
import { FullMessageType } from '../types/ChatTypes'
import { isString } from '../server/validation'
import { onMessageCbType, setEditMessageType } from '../App.tsx'
import './WriteBox.css'

type WriteBoxType = {
    login: string
    room: string
    onMessage: onMessageCbType
    editMessage: FullMessageType | undefined
    setEditMessage: setEditMessageType
    replyingTo?: string | null
    replyPreview?: string
    onCancelReply?: () => void
}

const WriteBox: React.FC<WriteBoxType> = ({
    login,
    room,
    onMessage,
    editMessage,
    setEditMessage,
    replyingTo,
    replyPreview,
    onCancelReply,
}) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const [message, setMessage] = useState('')
    const { warning, setWarning, setTemporaryWarning } = useTemporaryWarning()
    const [cursorPosition, setCursorPosition] = useState(0)
    const { launch } = useTimeout()

    useEffect(() => {
        if (editMessage) {
            setMessage(editMessage.text ?? '')
            inputRef.current?.focus()
        }
    }, [editMessage])

    useEffect(() => {
        if (replyingTo) inputRef.current?.focus()
    }, [replyingTo])

    const onChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const msg = e.target.value
            const warningMsg =
                msg.length >= settings.maxMsgSize
                    ? 'Characters limit reached'
                    : ''
            setWarning(warningMsg)
            setMessage(msg)
        },
        [setWarning]
    )

    const onKeyUp = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            const target = e.target as HTMLInputElement
            setCursorPosition(target.selectionStart ?? 0)
            const trimmedMessage = message.trim()
            const msgLength = trimmedMessage.length

            if (e.key === 'Escape') {
                setMessage('')
                setWarning('')
                setCursorPosition(0)
                setEditMessage(undefined)
                onCancelReply?.()
            } else if (e.key === 'Enter') {
                if (editMessage && msgLength === 0) {
                    setEditMessage(undefined)
                } else if (msgLength > 0 && msgLength < settings.maxMsgSize) {
                    onMessage({
                        ...editMessage,
                        room,
                        username: login,
                        text: trimmedMessage,
                    })
                    setMessage('')
                    setWarning('')
                    setCursorPosition(0)
                }
            }
        },
        [
            message,
            setWarning,
            setEditMessage,
            editMessage,
            onMessage,
            room,
            login,
            onCancelReply,
        ]
    )

    const onClick = useCallback((e: MouseEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement
        setCursorPosition(target?.selectionStart ?? 0)
    }, [])

    const onPaste = useCallback(
        (event: ClipboardEvent<HTMLInputElement>) => {
            const items = event.clipboardData.items
            for (const index in items) {
                const item = items[index]
                if (item.kind === 'file') {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                        const dataUrl = event.target?.result
                        if (!dataUrl || !isString(dataUrl)) return

                        if (!isDataUrlImg(dataUrl)) {
                            setTemporaryWarning(
                                'Pasted object is not an image (only images are supported)'
                            )
                            return
                        }

                        if (dataUrl.length > settings.maxMsgSize) {
                            const diff = dataUrl.length - settings.maxMsgSize
                            setTemporaryWarning(
                                `Pasted image is too big : ${diff} bytes above limit (${settings.maxMsgSize})`
                            )
                            return
                        }
                        onMessage({ username: login, room, text: dataUrl })
                    }

                    const file = item.getAsFile()
                    if (file) reader.readAsDataURL(file)
                }
            }
        },
        [onMessage, login, room, setTemporaryWarning]
    )

    const onSelectEmoji: selectEmojiPickerType = useCallback(
        (emoji) => {
            const { native } = emoji ?? {}
            if (native) {
                setMessage(insertAt(message, cursorPosition, native))
                const newPos = cursorPosition + 2
                setCursorPosition(newPos) // Move cursor after emoji
                // Let time to rerender react component before setting cursor position
                launch(() =>
                    inputRef.current?.setSelectionRange(newPos, newPos)
                )
            }
            inputRef.current?.focus()
        },
        [cursorPosition, launch, message]
    )

    return (
        login && (
            <>
                {replyingTo && (
                    <div className="WriteBoxReplyIndicator">
                        <span>
                            💬 Replying to message
                            {replyPreview ? ` "${replyPreview}"` : ''}
                        </span>
                        <button onClick={onCancelReply}>×</button>
                    </div>
                )}
                <div className="WriteBox">
                    <label className="WriteBoxLabel" htmlFor="msg">
                        {login}&nbsp;:
                    </label>
                    <input
                        type="text"
                        name="msg"
                        className="WriteBoxInput"
                        ref={inputRef}
                        value={message}
                        onChange={onChange}
                        onKeyUp={onKeyUp}
                        onPaste={onPaste}
                        onClick={onClick}
                        autoComplete="false"
                        minLength={1}
                        maxLength={settings.maxMsgSize || 2048}
                        autoFocus
                    ></input>
                    <EmojiPicker onSelectEmoji={onSelectEmoji} />
                </div>
                {warning && <Warning text={warning} />}
            </>
        )
    )
}
export default WriteBox
