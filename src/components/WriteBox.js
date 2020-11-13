import React, { useState } from 'react'
import { maxMsgSize } from '../config.json'
import { DATA_URL_IMG_PREFIX } from './media.constants'
import Warning from './Warning'
import './WriteBox.css'

export default function WriteBox(props) {
    const { login, onMessage } = props
    const [message, setMessage] = useState('')
    const [warning, setWarning] = useState('')

    function onChange(e) {
        setMessage(e.target.value)
    }

    function onKeyUp(e) {
        if (e.key === 'Enter' && message.trim().length > 0) {
            onMessage(message)
            setMessage('')
        }
    }

    let timeoutWarning
    function setTemporaryWarning(text) {
        setWarning(text)
        clearTimeout(timeoutWarning)
        timeoutWarning = setTimeout(() => setWarning(''), 4 * 1000)
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
                    if (!dataUrl.startsWith(DATA_URL_IMG_PREFIX)) {
                        setTemporaryWarning(
                            'Pasted object is not an image (only images are supported)'
                        )
                        return
                    }
                    if (dataUrl.length > maxMsgSize) {
                        const diff = dataUrl.length - maxMsgSize
                        setTemporaryWarning(
                            `Pasted image is too big : ${diff} above limit (${maxMsgSize})`
                        )
                        return
                    }
                    onMessage(dataUrl)
                }
                reader.readAsDataURL(item.getAsFile())
            }
        }
    }

    return (
        login && (
            <>
                <div className="WriteBox">
                    <label className="WriteBoxLabel" htmlFor="msg">
                        {props.login} :
                    </label>
                    <input
                        type="text"
                        name="msg"
                        className="WriteBoxInput"
                        value={message}
                        onChange={onChange}
                        onKeyUp={onKeyUp}
                        autoComplete="false"
                        minLength="1"
                        maxLength={maxMsgSize || 2048}
                        autoFocus
                        onPaste={onPaste}
                    ></input>
                </div>
                {warning && <Warning text={warning} />}
            </>
        )
    )
}
