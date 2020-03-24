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
import useEffectOnce from "./useEffectOnce"
import useEffectOnVisibilityChange , {isDocumentVisible} from "./useEffectOnVisibilityChange"
import Favicon from "react-favicon"
import logo512 from './logo512.png'
 

function App() {
  const [login, setLogin] = useState(localStorage.login || "")
  const [count, setCount] = useState(0)
  const [messages, setMessages] = useState([])

  const onLogin = v => {
    localStorage.setItem("login", v)
    setLogin(v)
  }

  useEffectOnce(() => {
    getInitialMessages().then(initialMessages => {
      setMessages(mergeMessages(messages, initialMessages))
    })
  })

  useEffect(() => {
    onIncomingMessage(incomingMessage => {
      if (!isDocumentVisible()) setCount(count+1)
      setMessages(mergeMessages(messages, incomingMessage))
    })
  }, [messages, setMessages, count, setCount])

  useEffectOnVisibilityChange(checkMissingMessages, messages)
  useEffectOnVisibilityChange(() => setCount(0), setCount)

  const onRefresh = () => checkMissingMessages(messages)

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
          <Favicon url={logo512} alertCount={count} />
          <WriteBox login={login} onMessage={onMessage} />
          <Messages login={login} messages={messages} />
          <RefreshButton className="RefreshButton" onRefresh={onRefresh} />
        </>
      )}
    </div>
  )
}

export default App
