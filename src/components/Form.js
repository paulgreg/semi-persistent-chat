import React, { useState } from 'react'
import Login from './Login'
import Room from './Room'
import useEffectOnce from '../services/useEffectOnce'

const generateRandomRoom = () => Math.random().toString(36).substr(2, 6)

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

export default function Form(props) {
    const roomFromLocation = getRoomFromLocation(window.location)
    const [room, setRoom] = useState(roomFromLocation || generateRandomRoom())
    const [login, setLogin] = useState(localStorage.login || '')

    const doLogin = (login, room) => {
        localStorage.setItem('login', login)
        window.history.pushState({}, `Chat in ${room}`, `?room=${room}`)
        props.onLogin && props.onLogin(login, room)
    }

    useEffectOnce(() => {
        roomFromLocation && isValidated(room, login) && doLogin(login, room)
    })

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
        <form name="loginAndRoom" autoComplete="off" onSubmit={onSubmit}>
            <Login login={login} onLoginChange={onLoginChange} />
            <Room room={room} onRoomChange={onRoomChange} />
            <input type="submit" value="Login" />
        </form>
    )
}
