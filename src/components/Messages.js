import React from "react"
import Linkify from "react-linkify"
import "./Messages.css"

const dateOptions = {
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric"
}

export default function Messages(props) {
  const { login, messages } = props

  function hightlightSameUser(text) {
    if (text.includes(login)) {
      return <span className="MessageSameUser">{text}</span>
    }
    return text
  }

  return (
    login && (
      <div className="Messages">
        {messages
          .sort(({ timestamp: ts1 }, { timestamp: ts2 }) => ts2 - ts1)
          .map(({ uuid, timestamp, user, message, validated }) => {
            const statusClassName = validated
              ? "MessagesCheck"
              : "MessagesPending"
            const statusSign = validated ? "✔" : "~"
            return (
              <div key={uuid} className="MessagesRow">
                <span className="MessagesTime">
                  {new Date(timestamp).toLocaleString(
                    navigator.language,
                    dateOptions
                  )}
                </span>
                <span className="MessagesUser">
                  {hightlightSameUser(user)} :
                </span>
                <span className="MessagesText">
                  <Linkify>{hightlightSameUser(message)}</Linkify>
                </span>
                <span className={`MessagesStatus ${statusClassName}`}>
                  {statusSign}
                </span>
                <span className="MessagesUuid">{uuid}</span>
              </div>
            )
          })}
      </div>
    )
  )
}
