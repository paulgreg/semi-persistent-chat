import path from 'path'
import express from 'express'
import http from 'http'
import morgan from 'morgan'
import { Server } from 'socket.io'
import fs from 'fs'
import {
    INITIAL_MSG,
    INCOMING,
    CHECK_MISSING,
    USER_ONLINE,
    USERS_ONLINE,
    PUSH_MSG,
    DELETE,
    DELETE_MSG,
} from '../services/messageTypes.mjs'
import addSummaryEndPoint from './fetchSummary.mjs'
import { validateMessage } from './validation.mjs'
import { isProd } from '../configuration.mjs'
import config from '../config.mjs'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DEV_URL = 'http://localhost:5173'

const app = express()
const server = http.Server(app)
const io = new Server(server, {
    path: '/persistent-chat-ws',
    cors: {
        origin: isProd() ? config.origin : DEV_URL,
        credentials: true,
    },
})

const SAVED_FILE = path.join(
    __dirname,
    '../../tmp-data/semi-persistent-chat-dump.json'
)

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE

const USER_TIMEOUT = 2 * MINUTE

let persistentMessages = []
let users = []

const getMessagesForRoom = (filterRoom) =>
    persistentMessages.filter(({ room }) => room === filterRoom)

const getUsernames = (filterRoom) =>
    users
        .filter(({ room }) => (filterRoom ? room === filterRoom : true))
        .map(({ username }) => username)

const findUserFromSocket = (socket) => users.find(({ s }) => s === socket)

io.on('connection', (socket) => {
    socket.on(INCOMING, (incomingMessage) => {
        try {
            const validatedMessage = validateMessage(incomingMessage)
            const { room } = validatedMessage
            const isEdition = Boolean(
                persistentMessages.find(
                    ({ uuid }) => uuid === incomingMessage.uuid
                )
            )
            if (!isEdition) {
                persistentMessages.push(validatedMessage)
            } else {
                persistentMessages = persistentMessages.map((m) =>
                    m.uuid === incomingMessage.uuid
                        ? {
                              ...m,
                              message: incomingMessage.message,
                              emojis: incomingMessage.emojis,
                          }
                        : m
                )
            }
            socket.to(room).emit(PUSH_MSG, validatedMessage)
            socket.emit(PUSH_MSG, validatedMessage)
        } catch (e) {
            console.error('error on incoming message', e)
        }
    })
    socket.on(DELETE, (uuid) => {
        try {
            if (uuid) {
                const message =
                    persistentMessages.find((m) => m.uuid === uuid) ?? {}
                const { room } = message
                if (room) {
                    persistentMessages = persistentMessages.filter(
                        (m) => m.uuid !== uuid
                    )
                    socket.to(room).emit(DELETE_MSG, uuid)
                    socket.emit(DELETE_MSG, uuid)
                }
            }
        } catch (e) {
            console.error('error on delete message', e)
        }
    })

    socket.on(CHECK_MISSING, (uuids) => {
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

    socket.on(USER_ONLINE, (userInfo) => {
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
                .emit(USERS_ONLINE, getUsernames(incomingRoom))
            socket.emit(USERS_ONLINE, getUsernames(incomingRoom))
        }
    })

    socket.on('disconnect', () => {
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
                socket.to(room).emit(USERS_ONLINE, getUsernames(room))
            }
        }
    })
})

app.use(morgan('combined'))
app.use('/', express.static(path.join(__dirname, '../../build')))

addSummaryEndPoint(app)

const start = () => {
    const p = process.env.PORT || config.port
    server.listen(p)
    console.log(`Server listeming on port ${p}`)
    console.log(`NODE_ENV=${process.env.NODE_ENV}`)
}

if (config.saveState && fs.existsSync(SAVED_FILE)) {
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
        console.log('deleting save file')
        fs.unlink(SAVED_FILE, (err) => {
            if (err) console.error('Failed to delete save file:', err)
        })
        start()
    })
} else {
    start()
}

let cleanupMessagesTimeout

const cleanupOldMessages = () => {
    clearTimeout(cleanupMessagesTimeout)
    const now = Date.now()
    const beforeMessagesNb = persistentMessages.length
    const cleanupTimestamp = config.cleanupTimeInHours * HOUR
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

const cleanupOldUsers = () => {
    const now = Date.now()
    const isAlive = (timestamp) => now - timestamp < USER_TIMEOUT

    clearTimeout(cleanupUsersTimeout)

    const timedOutUsers = users.filter(({ username, room, timestamp, s }) => {
        const timedOut = !isAlive(timestamp)
        if (timedOut) {
            console.log(`User "${username}" in room "${room}" has timedout`)
            if (s && s.close) s.close()
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

const registerGracefullShutdownOn = (signal) => {
    process.on(signal, () => {
        console.log(`received ${signal}, saving and stopping gracefully`)
        if (!config.saveState) return process.exit(0)
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
}
registerGracefullShutdownOn('SIGINT')
registerGracefullShutdownOn('SIGHUP')
registerGracefullShutdownOn('SIGTERM')
