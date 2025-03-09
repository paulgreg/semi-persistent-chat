import { useState, useCallback, useEffect, FormEvent } from 'react'
import Login from './Login'
import Room from './Room'
import { onLoginType } from '../App'
import settings from '../settings.json'
import './Home.css'
import { saveLoginInfo } from '../services/utils'

const generateRandomRoom = () => Math.random().toString(36).substring(2, 6)

const getRoomFromLocation = (location: Location) => {
    const params = location.search.replace(/\?/, '').split('&')
    const roomParam = params.find((p) => p.startsWith('room='))
    if (roomParam) {
        const p = roomParam.split('=')
        return p && p.length === 2 ? p[1] : undefined
    }
}

const clean = (s = '') => s.replace(/ /g, '-')

const isValidated = (login: string, room: string) =>
    login && room && login.length > 2 && room.length > 2

type HomeType = {
    onLogin: onLoginType
}

const Home: React.FC<HomeType> = ({ onLogin }) => {
    const roomFromLocation = getRoomFromLocation(window.location)
    const [room, setRoom] = useState(
        roomFromLocation ?? localStorage.room ?? generateRandomRoom()
    )
    const [login, setLogin] = useState(localStorage.login || '')

    const doLogin: onLoginType = useCallback(
        (login, room) => {
            saveLoginInfo(login, room)
            onLogin?.(login, room)
        },
        [onLogin]
    )

    useEffect(() => {
        if (roomFromLocation && isValidated(login, room)) {
            doLogin(login, room)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // should only been done once

    const onLoginChange = (l: string) => {
        setLogin(clean(l))
    }
    const onRoomChange = (r: string) => {
        setRoom(clean(r))
    }

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
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
                {settings.cleanupTimeInHours} hours
                {settings.sleep ? ', maybe sooner if app is set to sleep' : ''}.
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

export default Home
