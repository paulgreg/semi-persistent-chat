import React, { useState, useCallback, useEffect } from 'react'
import Login from './Login'
import Room from './Room'
import config from '../config.json'
import './Home.css'

const generateRandomRoom = () => Math.random().toString(36).substring(2, 6)

const getRoomFromLocation = (location) => {
    const params = location.search.replace(/\?/, '').split('&')
    const roomParam = params.find((p) => p.startsWith('room='))
    if (roomParam) {
        const p = roomParam.split('=')
        return p && p.length === 2 ? p[1] : undefined
    }
}

const clean = (s) => s.replace(/ /g, '-')

const isValidated = (login, room) =>
    login && room && login.length > 2 && room.length > 2

export default function Home({ onLogin }) {
    const roomFromLocation = getRoomFromLocation(window.location)
    const [room, setRoom] = useState(
        roomFromLocation || localStorage.room || generateRandomRoom()
    )
    const [login, setLogin] = useState(localStorage.login || '')

    const doLogin = useCallback(
        (login, room) => {
            localStorage.setItem('login', login)
            localStorage.setItem('room', room)
            window.history.pushState({}, `Chat in "${room}"`, `?room=${room}`)
            onLogin && onLogin(login, room)
        },
        [onLogin]
    )

    const onLoginChange = (l) => {
        setLogin(clean(l))
    }
    const onRoomChange = (r) => {
        setRoom(clean(r))
    }

    const onSubmit = (e) => {
        e.preventDefault()
        if (isValidated(login, room)) doLogin(login, room)
    }

    return (
        <div className="Home">
            <h1>Semi Persistent Chat</h1>
            <hr />
            <form name="loginAndRoom" autoComplete="off" onSubmit={onSubmit}>
                <Login login={login} onLoginChange={onLoginChange} />
                <Room room={room} onRoomChange={onRoomChange} />
                <input className="submit" type="submit" value="Login" />
            </form>
            <hr />
            <p>
                Share the room name (or the URL once logged in) to your friends
                to chat together.
            </p>
            <p>
                Messages will be deleted on server after{' '}
                {config.cleanupTimeInHours} hours.
            </p>
            <p>
                Do not use that service for confidential discussions.{' '}
                <a
                    href="https://github.com/paulgreg/semi-persistent-chat"
                    target="blank"
                >
                    Host it yourself and look at source code
                </a>{' '}
                if you wan’t more privacy.
            </p>
        </div>
    )
}
