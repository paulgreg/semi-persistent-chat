import React, { useState } from "react"
import "./Message.css"

export default function Message(props) {
  const [message, setMessage] = useState("")

  function onChange(e) {
    setMessage(e.target.value)
  }

  function onKeyUp(e) {
    if (e.key === "Enter") {
      props.onMessage && props.onMessage(message)
      setMessage("")
    }
  }

  return (
    <div className="Message">
      <label className="MessageLabel" htmlFor="msg">
        {props.login} <small>(you)</small> :
      </label>
      <input
        type="text"
        name="msg"
        className="MessageInput"
        value={message}
        onChange={onChange}
        onKeyUp={onKeyUp}
        autoFocus
      ></input>
    </div>
  )
}
