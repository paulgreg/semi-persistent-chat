const app = require("express")()
const server = require("http").Server(app)
const io = require("socket.io")(server, { path: "/persistent-chat-ws" })
const { validateMessage } = require("./validation")

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE

const { port, cleanupTimeInHours } = require("../config.json")

let persistentMessages = []
let users = []

const getUsernames = () => users.map(({ user }) => user)

io.on("connection", function (socket) {
  socket.emit("initialMessages", persistentMessages)

  socket.on("incomingMessage", function (incomingMessage) {
    try {
      const validatedMessage = validateMessage(incomingMessage)
      persistentMessages.push(validatedMessage)
      socket.broadcast.emit("pushMessage", validatedMessage)
      socket.emit("pushMessage", validatedMessage)
    } catch (e) {
      console.error("error on incoming message", e)
    }
  })

  socket.on("checkMissingMessages", function (uuids) {
    const clientUuids = (uuids || []).sort()
    const missing = persistentMessages.filter(
      ({ uuid }) => !clientUuids.includes(uuid)
    )
    if (missing.length) {
      console.log(new Date(), `Sending ${missing.length} missed messages to a client`)
      missing.map(message => socket.emit("pushMessage", message))
    }
  })

  socket.on("userOnline", function (username) {
    const userEntry = { user: username, timestamp: Date.now(), s: socket }
    const idx = users.findIndex(({ user }) => user === username)
    if (idx >= 0) {
      users[idx] = userEntry
    } else {
      users.push(userEntry)
      console.log(new Date(), `user online (${username})`)
      io.emit('usersOnline', getUsernames())
    }
  })

  socket.on('disconnect', function () {
    const beforeUsersNb = users.length
    users = users.filter(({ s }) => s !== socket)
    if (beforeUsersNb !== users.length) {
      console.log(new Date(), 'user offline')
      io.emit('usersOnline', getUsernames())
    }
  })
})

server.listen(port)
console.log(`Server listeming on port ${port}`)
console.log("NODE_ENV=", process.env.NODE_ENV)

let cleanupMessagesTimeout

function cleanupOldMessages() {
  clearTimeout(cleanupMessagesTimeout)
  const now = Date.now()
  const beforeMessagesNb = persistentMessages.length
  const cleanupTimestamp = cleanupTimeInHours * HOUR
  persistentMessages = persistentMessages.filter(({ timestamp }) => now - timestamp < cleanupTimestamp)
  const afterMessagesNb = persistentMessages.length
  if (beforeMessagesNb !== afterMessagesNb) {
    console.log(
      new Date(),
      `Purged ${beforeMessagesNb} message(s) (after ${cleanupTimestamp} ms). ${afterMessagesNb} message(s) still in memory`
    )
  }
  cleanupMessagesTimeout = setTimeout(cleanupOldMessages, HOUR)
}

cleanupOldMessages()


const USER_TIMEOUT = 2 * MINUTE
let cleanupUsersTimeout

function cleanupOldUsers() {
  clearTimeout(cleanupUsersTimeout)
  const beforeUsersNb = users.length
  const now = Date.now()
  users = users.filter(({ user, timestamp }) => {
    const alive = now - timestamp < USER_TIMEOUT
    if (!alive) console.log(`User ${user} has timedout`)
    return alive
  })
  if (beforeUsersNb !== users.length) io.emit('usersOnline', getUsernames())

  cleanupUsersTimeout = setTimeout(cleanupOldUsers, MINUTE)

}
cleanupOldUsers()


let logOnlineUsersTimeout

const logOnlineUsers = () => {
  clearTimeout(logOnlineUsersTimeout)
  if (users.length > 0) console.log(new Date(), 'current users : ', getUsernames())
  setTimeout(logOnlineUsers, 5 * MINUTE)
}
logOnlineUsers()
