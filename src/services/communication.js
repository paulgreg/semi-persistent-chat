import { port } from "../config.json"
import io from "socket.io-client"

const prod = process.env.NODE_ENV !== "production"

const portPart = prod ? `:${port}` : ""
const secure = prod
const baseUrl = `${window.location.hostname}${portPart}`

const socket = io.connect(baseUrl, { path: "/persistent-chat-ws", secure })

let onMessageCb

export function onIncomingMessage(cb) {
  onMessageCb = cb
}

socket.on("pushMessage", function(incomingMessage) {
  if (onMessageCb) onMessageCb(incomingMessage)
})

export function sendMessage(message) {
  socket.emit("incomingMessage", message)
}

export function getInitialMessages() {
  return new Promise(resolve => {
    socket.on("initialMessages", function(initialMessages) {
      resolve(initialMessages)
    })
  })
}

export function checkMissingMessages(messages) {
  socket.emit("checkMissingMessages", messages.map(({ uuid }) => uuid))
}
