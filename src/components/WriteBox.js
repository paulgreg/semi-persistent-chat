import React, { useState } from 'react'
import './WriteBox.css'

export default function WriteBox(props) {
    const { login, onMessage } = props
    const [message, setMessage] = useState('')

    function onChange(e) {
        setMessage(e.target.value)
    }

    function onKeyUp(e) {
        if (e.key === 'Enter' && message.length > 0) {
            onMessage(message)
            setMessage('')
        }
    }

    return (
        login && (
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
                    autoFocus
                ></input>
            </div>
        )
    )
}
