import React, { useState } from "react"
import "./Global.css"
import "./App.css"
import Login from "./components/Login"
import Message from "./components/Message"
import Messages from "./components/Messages"

function App() {
  let messages = [{ timestamp: Date.now(), user: "test", message: "test" }]

  const [login, setLogin] = useState("")

  const onLogin = v => setLogin(v)

  const onMessage = m => {
    messages = messages.concat([
      { timestamp: Date.now(), user: login, message: m }
    ])
  }

  return (
    <div className="App">
      <header className="Header">
        <h1>Chat</h1>
        <Login onLogin={onLogin} />
      </header>
      {login && (
        <>
          <Messages className="Messages" messages={messages} />
          <Message className="Message" onMessage={onMessage} />
        </>
      )}
    </div>
  )
}

export default App
