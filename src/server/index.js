const path = require('path')
const express = require('express')
const app = express()
const server = require('http').Server(app)
const morgan = require('morgan')
const io = require('socket.io')(server, { path: '/persistent-chat-ws' })
const fs = require('fs')
const { validateMessage } = require('./validation')
const {
    INITIAL_MSG,
    INCOMING_MSG,
    CHECK_MISSING_MSG,
    USER_ONLINE,
    USERS_ONLINE,
    PUSH_MSG,
} = require('../services/messageTypes')
const addSummaryEndPoint = require('./fetchSummary')

const SAVED_FILE = '/tmp/semi-persistent-chat-dump.json'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE

const USER_TIMEOUT = 2 * MINUTE

const { port, cleanupTimeInHours, saveState } = require('../config.json')

let persistentMessages = []
let users = []

const getMessagesForRoom = (filterRoom) =>
    persistentMessages.filter(({ room }) => room === filterRoom)

const getUsernames = (filterRoom) =>
    users
        .filter(({ room }) => (filterRoom ? room === filterRoom : true))
        .map(({ username }) => username)

const findUserFromSocket = (socket) => users.find(({ s }) => s === socket)

io.on('connection', function (socket) {
    socket.on(INCOMING_MSG, function (incomingMessage) {
        try {
            const validatedMessage = validateMessage(incomingMessage)
            const { room } = validatedMessage
            persistentMessages.push(validatedMessage)
            socket.to(room).broadcast.emit(PUSH_MSG, validatedMessage)
            socket.emit(PUSH_MSG, validatedMessage)
        } catch (e) {
            console.error('error on incoming message', e)
        }
    })

    socket.on(CHECK_MISSING_MSG, function (uuids) {
        const clientUuids = uuids || []
        const user = findUserFromSocket(socket)
        if (!user) return
        const missingMessageForUser = persistentMessages.filter(
            ({ uuid, room }) =>
                room === user.room && !clientUuids.includes(uuid)
        )
        if (missingMessageForUser.length) {
            console.log(
                new Date(),
                `Sending ${missingMessageForUser.length} missed messages to a client`
            )
            socket.emit(PUSH_MSG, missingMessageForUser)
        }
    })

    socket.on(USER_ONLINE, function (userInfo) {
        const { username: incomingUsername, room: incomingRoom } = userInfo
        socket.join(incomingRoom)
        socket.emit(INITIAL_MSG, getMessagesForRoom(incomingRoom))

        const userEntry = {
            username: incomingUsername,
            room: incomingRoom,
            timestamp: Date.now(),
            s: socket,
        }
        const idx = users.findIndex(
            ({ username, room }) =>
                username === incomingUsername && room === incomingRoom
        )
        if (idx >= 0) {
            users[idx] = userEntry
        } else {
            users.push(userEntry)
            console.log(
                new Date(),
                `user "${incomingUsername}" in room "${incomingRoom}" is online`
            )

            socket
                .to(incomingRoom)
                .broadcast.emit(USERS_ONLINE, getUsernames(incomingRoom))
            socket.emit(USERS_ONLINE, getUsernames(incomingRoom))
        }
    })

    socket.on('disconnect', function () {
        const beforeUsersNb = users.length
        const user = findUserFromSocket(socket)
        if (user) {
            const { username, room } = user
            socket.disconnect()
            users = users.filter(({ s }) => s !== socket)
            if (beforeUsersNb !== users.length) {
                console.log(
                    new Date(),
                    `user "${username}" in room "${room}" is offline`
                )
                socket.to(room).broadcast.emit(USERS_ONLINE, getUsernames(room))
            }
        }
    })
})

app.use(morgan('combined'))
app.use('/', express.static(path.join(__dirname, '../../build')))

addSummaryEndPoint(app)

function start() {
    const p = process.env.PORT || port
    server.listen(p)
    console.log(`Server listeming on port ${p}`)
    console.log(`NODE_ENV=${process.env.NODE_ENV}`)
}

if (saveState && fs.existsSync(SAVED_FILE)) {
    console.log('save file exists')
    fs.readFile(SAVED_FILE, 'utf8', (err, data) => {
        console.log('read save file', data)
        if (err) console.error('Failed to load file:', err)
        let savedMsgs
        try {
            savedMsgs = data && JSON.parse(data)
        } catch (e) {
            console.error('failed to load messages:', e)
        }
        if (savedMsgs) {
            console.log(
                `Loading ${savedMsgs.length} messages from ${SAVED_FILE}`
            )
            persistentMessages = persistentMessages.concat(savedMsgs)
        }
        start()
    })
} else {
    start()
}

let cleanupMessagesTimeout

function cleanupOldMessages() {
    clearTimeout(cleanupMessagesTimeout)
    const now = Date.now()
    const beforeMessagesNb = persistentMessages.length
    const cleanupTimestamp = cleanupTimeInHours * HOUR
    persistentMessages = persistentMessages.filter(
        ({ timestamp }) => now - timestamp < cleanupTimestamp
    )
    const afterMessagesNb = persistentMessages.length
    if (beforeMessagesNb !== afterMessagesNb) {
        console.log(
            new Date(),
            `Purged ${beforeMessagesNb} message(s) (after ${cleanupTimestamp} ms). ${afterMessagesNb} message(s) still in memory`
        )
    } else {
        console.log(new Date(), `${afterMessagesNb} message(s) still in memory`)
    }
    cleanupMessagesTimeout = setTimeout(cleanupOldMessages, HOUR)
}

cleanupOldMessages()

const getUsersByRoom = (u) =>
    u.reduce((acc, current) => {
        const { username, room } = current
        acc[room] ? acc[room].push(username) : (acc[room] = [username])
        return acc
    }, {})

let cleanupUsersTimeout

function cleanupOldUsers() {
    const now = Date.now()
    const isAlive = (timestamp) => now - timestamp < USER_TIMEOUT

    clearTimeout(cleanupUsersTimeout)

    const timedOutUsers = users.filter(({ username, room, timestamp, s }) => {
        const timedOut = !isAlive(timestamp)
        if (timedOut) {
            console.log(`User "${username}" in room "${room}" has timedout`)
            if (s) s.close()
        }
        return timedOut
    })
    if (timedOutUsers.length)
        console.log('timedOutUsers nb', timedOutUsers.length)

    const roomsWhereUsersHaveTimedOut = Object.keys(
        getUsersByRoom(timedOutUsers)
    )
    if (roomsWhereUsersHaveTimedOut.length)
        console.log('roomsWherUserHaveTimedOut', roomsWhereUsersHaveTimedOut)

    if (roomsWhereUsersHaveTimedOut.length > 0) {
        users.forEach(({ username, room, s }) => {
            if (roomsWhereUsersHaveTimedOut.includes(room)) {
                console.log(
                    `sending to "${username}" list of user in room "${room}"`
                )
                s.emit(USERS_ONLINE, getUsernames(room))
            }
        })
    }

    users = users.filter(({ timestamp }) => isAlive(timestamp)) // keeping in users user alive

    cleanupUsersTimeout = setTimeout(cleanupOldUsers, MINUTE)
}
cleanupOldUsers()

let logOnlineUsersTimeout

const logOnlineUsers = () => {
    clearTimeout(logOnlineUsersTimeout)
    if (users.length > 0)
        console.log(new Date(), 'current users : ', getUsersByRoom(users))
    setTimeout(logOnlineUsers, HOUR)
}
logOnlineUsers()

process.on('SIGINT', function () {
    console.log('Stopping gracefully')
    if (!saveState) return process.exit(0)
    fs.writeFile(SAVED_FILE, JSON.stringify(persistentMessages), (err) => {
        if (err) {
            console.log(err)
            process.exit(err)
        }
        console.log(
            `${persistentMessages.length} messages saved in ${SAVED_FILE}`
        )
        process.exit(0)
    })
})
