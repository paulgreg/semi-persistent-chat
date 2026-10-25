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
import { insertAt, isString } from './strings.ts'
import { useTemporaryWarning } from './temporaryWarning'
import useTimeout from './useTimeout'
import Warning from './Warning.tsx'
import { FullMessageType } from '../types/ChatTypes'
import { onMessageCbType, setEditMessageType } from '../App.tsx'
import s from './WriteBox.module.css'
import { clientConfig } from '../services/clientConfig.ts'

// Encrypted content is ~1.33x bigger (base64 + envelope + auth tag): lower the
// client limit so the server never truncates an encrypted message (truncated
// ciphertext is unrecoverable)
const ENCRYPTION_SIZE_OVERHEAD_FACTOR = 1.5

type WriteBoxType = {
    login: string
    room: string
    password: string
    onMessage: onMessageCbType
    editMessage: FullMessageType | undefined
    setEditMessage: setEditMessageType
    initialMessage?: string
    replyingTo?: string | null
    replyPreview?: string
    onCancelReply?: () => void
}

const WriteBox: React.FC<WriteBoxType> = ({
    login,
    room,
    password,
    onMessage,
    editMessage,
    setEditMessage,
    initialMessage,
    replyingTo,
    replyPreview,
    onCancelReply,
}) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const initialMessageApplied = useRef(false)
    const [message, setMessage] = useState('')
    const { warning, setWarning, setTemporaryWarning } = useTemporaryWarning()
    const [cursorPosition, setCursorPosition] = useState(0)
    const { launch } = useTimeout()

    const effectiveMaxMsgSize = password
        ? Math.floor(clientConfig.maxMsgSize / ENCRYPTION_SIZE_OVERHEAD_FACTOR)
        : clientConfig.maxMsgSize

    useEffect(() => {
        if (editMessage) {
            setMessage(editMessage.text ?? '')
            inputRef.current?.focus()
        }
    }, [editMessage])

    useEffect(() => {
        if (replyingTo) inputRef.current?.focus()
    }, [replyingTo])

    useEffect(() => {
        if (initialMessageApplied.current || !initialMessage) return
        setMessage(initialMessage)
        initialMessageApplied.current = true
    }, [initialMessage])

    const onChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const msg = e.target.value
            const warningMsg =
                msg.length >= effectiveMaxMsgSize
                    ? `Characters limit reached${password ? ' (lowered to leave room for encryption)' : ''}`
                    : ''
            setWarning(warningMsg)
            setMessage(msg)
        },
        [setWarning, effectiveMaxMsgSize, password]
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
                } else if (msgLength > 0 && msgLength < effectiveMaxMsgSize) {
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
            effectiveMaxMsgSize,
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

                        if (dataUrl.length > effectiveMaxMsgSize) {
                            const diff = dataUrl.length - effectiveMaxMsgSize
                            setTemporaryWarning(
                                `Pasted image is too big : ${diff} bytes above limit (${effectiveMaxMsgSize})`
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
        [onMessage, login, room, setTemporaryWarning, effectiveMaxMsgSize]
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
                    <div className={s.WriteBoxReplyIndicator}>
                        <span>
                            💬 Replying to message
                            {replyPreview ? ` "${replyPreview}"` : ''}
                        </span>
                        <button
                            className={s.WriteBoxReplyIndicatorButton}
                            onClick={onCancelReply}
                        >
                            ×
                        </button>
                    </div>
                )}
                <div className={s.WriteBox}>
                    <label className={s.WriteBoxLabel} htmlFor="msg">
                        {login}&nbsp;:
                    </label>
                    <input
                        type="text"
                        name="msg"
                        className={s.WriteBoxInput}
                        ref={inputRef}
                        value={message}
                        onChange={onChange}
                        onKeyUp={onKeyUp}
                        onPaste={onPaste}
                        onClick={onClick}
                        autoComplete="false"
                        minLength={1}
                        maxLength={effectiveMaxMsgSize}
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
