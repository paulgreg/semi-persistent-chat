import path from 'path'
import express from 'express'
import http from 'http'
import morgan from 'morgan'
import { Server } from 'socket.io'
import type { Socket } from 'socket.io'
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
} from '../services/messageTypes'
import addSummaryEndPoint from './fetchSummary'
import { validateMessage } from './validation'
import { isProd } from '../configuration'
import settings from '../settings.json'
import { fileURLToPath } from 'url'
import { arrayEquals } from '../array'
import debug from 'debug'
import {
    ServerUserType,
    EventUserOnlineType,
    FullMessageType,
    EventIncomingMessageType,
    EventDeleteType,
    EventCheckMissingType,
    EventInitialMessagesType,
    EventUsersOnlineType,
    UsersType,
    EventPushType,
} from '../types/ChatTypes'

const d = debug('chat')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DEV_URL = 'http://localhost:5173'

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    path: '/persistent-chat-ws',
    cors: {
        origin: isProd() ? settings.origin : DEV_URL,
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

let persistentMessages: Array<FullMessageType> = []
let users: Array<ServerUserType> = []

const getMessagesForRoom = (filterRoom: string) =>
    persistentMessages.filter(({ room }) => room === filterRoom)

const getUsernames = (filterRoom: string): UsersType =>
    users
        .filter(({ room }) => (filterRoom ? room === filterRoom : true))
        .map(({ username }) => ({ username }))

const findUserFromSocket = (socket: Socket) =>
    users.find(({ s }) => s === socket)

io.on('connection', (socket) => {
    socket.on(USER_ONLINE, (userInfo: EventUserOnlineType) => {
        if (d.enabled) d('user online', userInfo)
        const { username: incomingUsername, room: incomingRoom } = userInfo

        socket.join(incomingRoom)
        const payload: EventInitialMessagesType = {
            initialMessages: getMessagesForRoom(incomingRoom),
        }
        socket.emit(INITIAL_MSG, payload)

        const idx = users.findIndex(
            ({ username, room }) =>
                username === incomingUsername && room === incomingRoom
        )

        const userEntry = {
            username: incomingUsername,
            room: incomingRoom,
            timestamp: Date.now(),
            s: socket,
        }

        if (idx >= 0) {
            users[idx] = userEntry
        } else {
            users.push(userEntry)

            console.log(
                new Date(),
                `user "${incomingUsername}" in room "${incomingRoom}" is online`
            )

            const payload: EventUsersOnlineType = {
                users: getUsernames(incomingRoom),
            }

            socket.to(incomingRoom).emit(USERS_ONLINE, payload)
            socket.emit(USERS_ONLINE, payload)
        }
    })

    socket.on(
        INCOMING,
        ({ message: incomingMessage }: EventIncomingMessageType) => {
            if (d.enabled) d('incoming message', incomingMessage)
            try {
                const validatedMessage = validateMessage(incomingMessage)
                const isEdition = Boolean(
                    persistentMessages.find(
                        ({ msgId }) => msgId === incomingMessage.msgId
                    )
                )
                if (!isEdition) {
                    if (d.enabled) d('new message')
                    persistentMessages.push(validatedMessage)
                } else {
                    if (d.enabled) d('edit message')
                    persistentMessages = persistentMessages.map((m) =>
                        m.msgId === validatedMessage.msgId
                            ? {
                                  ...m,
                                  text: validatedMessage.text,
                                  emojis: validatedMessage.emojis,
                              }
                            : m
                    )
                }
                const { room } = validatedMessage
                const payload: EventPushType = { message: validatedMessage }
                socket.to(room).emit(PUSH_MSG, payload)
                socket.emit(PUSH_MSG, payload)
            } catch (e) {
                console.error('error on incoming message', e)
            }
        }
    )
    socket.on(DELETE, ({ msgId }: EventDeleteType) => {
        if (d.enabled) d('delete message', msgId)
        try {
            if (msgId) {
                const message = persistentMessages.find(
                    (m) => m.msgId === msgId
                )

                const { room } = message ?? {}
                if (room) {
                    persistentMessages = persistentMessages.filter(
                        (m) => m.msgId !== msgId
                    )
                    const payload: EventDeleteType = { msgId }
                    socket.to(room).emit(DELETE_MSG, payload)
                    socket.emit(DELETE_MSG, payload)
                }
            }
        } catch (e) {
            console.error('error on delete message', e)
        }
    })

    socket.on(CHECK_MISSING, ({ msgIds }: EventCheckMissingType) => {
        if (d.enabled) d('check missing message', msgIds)
        const user = findUserFromSocket(socket)
        if (!user) return
        const roomMessages = persistentMessages.filter(
            ({ room }) => room === user.room
        )
        const missedMessages = roomMessages.filter((message) => {
            const userUuid = msgIds[message.msgId]
            if (!userUuid) return true
            return !arrayEquals(userUuid, message.emojis)
        })

        if (missedMessages.length) {
            console.info(
                new Date(),
                `Sending ${missedMessages.length} missed messages to a client`
            )
            roomMessages.forEach((m) => {
                const payload: EventPushType = { message: m }
                socket.emit(PUSH_MSG, payload)
            })
        }
    })

    socket.on('disconnect', () => {
        if (d.enabled) d('disconnect')
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
                const payload: EventUsersOnlineType = {
                    users: getUsernames(room),
                }
                socket.to(room).emit(USERS_ONLINE, payload)
            }
        }
    })
})

app.use(morgan('combined'))
app.use('/', express.static(path.join(__dirname, '../../dist')))

addSummaryEndPoint(app)

const start = () => {
    const p = process.env.PORT ?? settings.port
    server.listen(p)
    console.info(`Server listeming on port ${p}`)
    console.info(`NODE_ENV=${process.env.NODE_ENV}`)
}

if (settings.saveState && fs.existsSync(SAVED_FILE)) {
    console.info('save file exists')
    fs.readFile(SAVED_FILE, 'utf8', (err, data) => {
        console.info('read save file', data)
        if (err) console.error('Failed to load file:', err)
        let savedMsgs
        try {
            savedMsgs = data && JSON.parse(data)
        } catch (e) {
            console.error('failed to load messages:', e)
        }
        if (savedMsgs) {
            console.info(
                `Loading ${savedMsgs.length} messages from ${SAVED_FILE}`
            )
            persistentMessages = persistentMessages.concat(savedMsgs)
        }
        console.info('deleting save file')
        fs.unlink(SAVED_FILE, (err) => {
            if (err) console.error('Failed to delete save file:', err)
        })
        start()
    })
} else {
    start()
}

let cleanupMessagesTimeout: NodeJS.Timeout

const cleanupOldMessages = () => {
    clearTimeout(cleanupMessagesTimeout)
    const now = Date.now()
    const beforeMessagesNb = persistentMessages.length
    const cleanupTimestamp = settings.cleanupTimeInHours * HOUR
    persistentMessages = persistentMessages.filter(
        ({ timestamp }) => now - timestamp < cleanupTimestamp
    )
    const afterMessagesNb = persistentMessages.length
    if (beforeMessagesNb !== afterMessagesNb) {
        console.info(
            new Date(),
            `Purged ${beforeMessagesNb} message(s) (after ${cleanupTimestamp} ms). ${afterMessagesNb} message(s) still in memory`
        )
    } else {
        console.info(
            new Date(),
            `${afterMessagesNb} message(s) still in memory`
        )
    }
    cleanupMessagesTimeout = setTimeout(cleanupOldMessages, HOUR)
}

cleanupOldMessages()

const getUsersByRoom = (u: Array<ServerUserType>) =>
    u.reduce((acc: Record<string, Array<string>>, current) => {
        const { username, room } = current
        if (acc[room]) {
            acc[room].push(username)
        } else {
            acc[room] = [username]
        }
        return acc
    }, {})

let cleanupUsersTimeout: NodeJS.Timeout

const cleanupOldUsers = () => {
    const now = Date.now()
    const isAlive = (timestamp: number) => now - timestamp < USER_TIMEOUT

    clearTimeout(cleanupUsersTimeout)

    const timedOutUsers = users.filter(({ username, room, timestamp, s }) => {
        const timedOut = !isAlive(timestamp)
        if (timedOut) {
            console.warn(`User "${username}" in room "${room}" has timedout`)
            s?.disconnect()
        }
        return timedOut
    })
    if (timedOutUsers.length)
        console.info('timedOutUsers nb', timedOutUsers.length)

    const roomsWhereUsersHaveTimedOut = Object.keys(
        getUsersByRoom(timedOutUsers)
    )
    if (roomsWhereUsersHaveTimedOut.length)
        console.info('roomsWherUserHaveTimedOut', roomsWhereUsersHaveTimedOut)

    if (roomsWhereUsersHaveTimedOut.length > 0) {
        users.forEach(({ username, room, s }) => {
            if (roomsWhereUsersHaveTimedOut.includes(room)) {
                console.info(
                    `sending to "${username}" list of user in room "${room}"`
                )
                const payload: EventUsersOnlineType = {
                    users: getUsernames(room),
                }
                s.emit(USERS_ONLINE, payload)
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
        console.info(new Date(), 'current users : ', getUsersByRoom(users))
    setTimeout(logOnlineUsers, HOUR)
}
logOnlineUsers()

const registerGracefullShutdownOn = (
    signal: 'SIGINT' | 'SIGHUP' | 'SIGTERM'
) => {
    process.on(signal, () => {
        console.info(`received ${signal}, saving and stopping gracefully`)
        if (!settings.saveState) return process.exit(0)
        fs.writeFile(SAVED_FILE, JSON.stringify(persistentMessages), (err) => {
            if (err) {
                console.error(err)
                process.exit(1)
            }
            console.info(
                `${persistentMessages.length} messages saved in ${SAVED_FILE}`
            )
            process.exit(0)
        })
    })
}
registerGracefullShutdownOn('SIGINT')
registerGracefullShutdownOn('SIGHUP')
registerGracefullShutdownOn('SIGTERM')
