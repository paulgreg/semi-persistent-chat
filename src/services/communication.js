import { port } from "../config.json"
import io from "socket.io-client"

const prod = process.env.NODE_ENV !== "production"

const portPart = prod ? `:${port}` : ""
const secure = prod
const baseUrl = `${window.location.hostname}${portPart}`

const socket = io.connect(baseUrl, { path: "/persistent-chat-ws", secure })

let onMessageCb, onUsersOnlineCb

export function onIncomingMessage(cb) {
  onMessageCb = cb
}

export function onUsersOnline(cb) {
  onUsersOnlineCb = cb
}

socket.on("pushMessage", function (incomingMessage) {
  if (onMessageCb) onMessageCb(incomingMessage)
})

socket.on("usersOnline", function (users) {
  if (onUsersOnlineCb) onUsersOnlineCb(users)
})

export function sendMessage(message) {
  socket.emit("incomingMessage", message)
}

export function getInitialMessages() {
  return new Promise(resolve => {
    socket.on("initialMessages", function (initialMessages) {
      resolve(initialMessages)
    })
  })
}

export function checkMissingMessages(messages) {
  socket.emit("checkMissingMessages", messages.map(({ uuid }) => uuid))
}

export function notifyUserOnline(user) {
  socket.emit("userOnline", user)
}
