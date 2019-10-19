import React from "react"

export default function Messages(props) {
  const { messages } = props
  console.log("messages", messages)

  return (
    <div className="Messages">
      {messages.map(({ timestamp, user, message }) => {
        console.log("loop", user)
        return (
          <div key={`${timestamp}-${user}`}>
            {timestamp} {user} {message}
          </div>
        )
      })}
    </div>
  )
}
