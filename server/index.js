const app = require("express")()
const server = require("http").Server(app)
const io = require("socket.io")(server, { path: "/persistent-chat-ws" })

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE

const { port, cleanupTimeInHours } = require("../src/config.json")

let persistentMessages = []

io.on("connection", function(socket) {
  socket.emit("initialMessages", persistentMessages)

  socket.on("incomingMessage", function(incomingMessage) {
    const validatedMessage = {
      ...incomingMessage,
      timestamp: Date.now(),
      validated: true
    }
    persistentMessages.push(validatedMessage)
    socket.broadcast.emit("pushMessage", validatedMessage)
    socket.emit("pushMessage", validatedMessage)
  })
})

server.listen(port)
console.log(`Server listeming on port ${port}`)
console.log('NODE_ENV=', process.env.NODE_ENV)

function cleanupOldMessages() {
  const beforeMessagesNb = persistentMessages.length
  const now = Date.now()
  const cleanupTimeStamp = cleanupTimeInHours * HOUR
  persistentMessages = persistentMessages.filter(
    ({ timestamp }) => now - timestamp < cleanupTimeStamp
  )
  const afterMessagesNb = persistentMessages.length
  console.log(
    new Date(),
    `Purging ${beforeMessagesNb} message(s) (after ${cleanupTimeStamp} ms). ${afterMessagesNb} message(s) still in memory`
  )
  setTimeout(cleanupOldMessages, HOUR)
}

cleanupOldMessages()
