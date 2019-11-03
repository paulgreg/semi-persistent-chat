import React, { useState, useEffect } from "react"
import "./Global.css"
import "./App.css"
import Login from "./components/Login"
import WriteBox from "./components/WriteBox"
import Messages from "./components/Messages"
import RefreshButton from "./components/RefreshButton"
import uuid from "uuid/v1"
import {
  sendMessage,
  onIncomingMessage,
  getInitialMessages,
  checkMissingMessages
} from "./services/communication"
import mergeMessages from "./mergeMessages"

function App() {
  const [login, setLogin] = useState(localStorage.login || "")
  const [messages, setMessages] = useState([])
  const [initialMessageLoading, setInitialMessageLoading] = useState(false)

  const onLogin = v => {
    localStorage.setItem("login", v)
    setLogin(v)
  }

  useEffect(() => {
    if (!initialMessageLoading) {
      setInitialMessageLoading(true)
      getInitialMessages().then(initialMessages => {
        setMessages(mergeMessages(messages, initialMessages))
      })
    }
  }, [messages, setMessages, initialMessageLoading, setInitialMessageLoading])

  useEffect(() => {
    onIncomingMessage(incomingMessage => {
      setMessages(mergeMessages(messages, incomingMessage))
    })
  }, [messages, setMessages])

  useEffect(() => {
    const checkFn = () => {
      if (document.visibilityState === "visible") {
        checkMissingMessages(messages)
      }
    }
    document.addEventListener("visibilitychange", checkFn)
    return () => document.removeEventListener("visibilitychange", checkFn)
  }, [messages])

  const onRefresh = () => {
    checkMissingMessages(messages)
  }

  const onMessage = text => {
    const m = {
      uuid: uuid(),
      timestamp: Date.now(),
      user: login,
      message: text,
      validated: false
    }
    sendMessage(m)
    setMessages(mergeMessages(messages, m))
  }

  return (
    <div className="App">
      {!login && <Login onLogin={onLogin} />}
      {login && (
        <>
          <WriteBox login={login} onMessage={onMessage} />
          <Messages login={login} messages={messages} />
          <RefreshButton className="RefreshButton" onRefresh={onRefresh} />
        </>
      )}
    </div>
  )
}

export default App
