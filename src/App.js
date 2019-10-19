import React, { useState, useEffect } from "react"
import "./Global.css"
import "./App.css"
import Login from "./components/Login"
import WriteBox from "./components/WriteBox"
import Messages from "./components/Messages"
import uuid from "uuid/v1"
import {
  sendMessage,
  onIncomingMessage,
  getInitialMessages
} from "./services/communication"

function mergeMessages(messages = [], newMessages = []) {
  const merged = messages.concat(newMessages)
  const validatedIds = merged
    .filter(({ validated }) => validated)
    .map(({ uuid }) => uuid)
  const withoutUnvalidatedMessages = merged.filter(
    ({ uuid, validated }) => validated || !validatedIds.includes(uuid)
  )
  return withoutUnvalidatedMessages
}

function App() {
  const [login, setLogin] = useState("")
  const [messages, setMessages] = useState([])
  const [initialMessageLoading, setInitialMessageLoading] = useState(false)

  const onLogin = v => setLogin(v)

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

  const onMessage = text => {
    const m = {
      uuid: uuid(),
      timestamp: Date.now(),
      user: login,
      message: text,
      validated: false
    }
    sendMessage(m)
    setMessages(messages.concat(m))
  }

  return (
    <div className="App">
      <header className="Header">
        <h1>Chat</h1>
        <Login onLogin={onLogin} />
      </header>
      <WriteBox className="Message" login={login} onMessage={onMessage} />
      <Messages className="Messages" login={login} messages={messages} />
    </div>
  )
}

export default App
