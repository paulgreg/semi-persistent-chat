import React, { useRef, useState } from 'react'
import { maxMsgSize } from '../config.json'
import { isDataUrlImg } from '../media'
import { EmojiPicker } from './EmojiPicker'
import { insertAt } from './strings'
import { useTemporaryWarning } from './temporaryWarning'
import useTimeout from './useTimeout'
import Warning from './Warning'
import './WriteBox.css'

export default function WriteBox(props) {
    const inputRef = useRef()
    const { login, onMessage } = props
    const [message, setMessage] = useState('')
    const [warning, setWarning, setTemporaryWarning] = useTemporaryWarning()
    const [cursorPosition, setCursorPosition] = useState(0)
    const [launch] = useTimeout()

    function onChange(e) {
        const msg = e.target.value
        setWarning(msg.length >= maxMsgSize ? 'Characters limit reached' : '')
        setMessage(msg)
    }

    function onKeyUp(e) {
        setCursorPosition(e.target.selectionStart)
        const trimmedMessage = message.trim()
        const length = trimmedMessage.length
        if (e.key === 'Enter' && length > 0 && length < maxMsgSize) {
            onMessage(message)
            setMessage('')
            setWarning('')
            setCursorPosition(0)
        }
    }
    function onClick(e) {
        setCursorPosition(e.target.selectionStart)
    }

    function onPaste(event) {
        var items = (event.clipboardData || event.originalEvent.clipboardData)
            .items
        for (const index in items) {
            const item = items[index]
            if (item.kind === 'file') {
                const reader = new FileReader()
                reader.onload = (event) => {
                    const dataUrl = event.target.result
                    if (!isDataUrlImg(dataUrl)) {
                        setTemporaryWarning(
                            'Pasted object is not an image (only images are supported)'
                        )
                        return
                    }
                    if (dataUrl.length > maxMsgSize) {
                        const diff = dataUrl.length - maxMsgSize
                        setTemporaryWarning(
                            `Pasted image is too big : ${diff} bytes above limit (${maxMsgSize})`
                        )
                        return
                    }
                    onMessage(dataUrl)
                }
                reader.readAsDataURL(item.getAsFile())
            }
        }
    }

    function onSelectEmoji(emoji = {}) {
        const { native } = emoji
        if (native) {
            setMessage(insertAt(message, cursorPosition, native))
            const newPos = cursorPosition + 2
            setCursorPosition(newPos) // Move cursor after emoji
            // Let time to rerender react component before setting cursor position
            launch(() => inputRef.current.setSelectionRange(newPos, newPos))
        }
        inputRef.current.focus()
    }

    return (
        login && (
            <>
                <div className="WriteBox">
                    <label className="WriteBoxLabel" htmlFor="msg">
                        {props.login}&nbsp;:
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
                        minLength="1"
                        maxLength={maxMsgSize || 2048}
                        autoFocus
                    ></input>
                    <EmojiPicker onSelectEmoji={onSelectEmoji} />
                </div>
                {warning && <Warning text={warning} />}
            </>
        )
    )
}
