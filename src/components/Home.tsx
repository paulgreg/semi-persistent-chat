import { useState, useCallback, useEffect, SubmitEventHandler } from 'react'
import Login from './Login'
import Room from './Room'
import Password from './Password'
import { onLoginType } from '../App'
import { getPasswordFromLocation, saveLoginInfo } from '../services/utils'
import { isEncryptionSupported } from '../services/crypto'
import { clientConfig } from '../services/clientConfig'
import s from './Home.module.css'

const generateRandomRoom = () => Math.random().toString(36).substring(2, 6)

const getRoomFromLocation = (location: Location) => {
    const params = location.search.replace(/\?/, '').split('&')
    const roomParam = params.find((p) => p.startsWith('room='))
    if (roomParam) {
        const p = roomParam.split('=')
        return p?.length === 2 ? p[1] : undefined
    }
}

const clean = (s = '') => s.replaceAll(' ', '-')

const isValidated = (login: string, room: string) =>
    login && room && login.length > 2 && room.length > 2

type HomeType = {
    userId: string
    onLogin: onLoginType
}

const Home: React.FC<HomeType> = ({ userId, onLogin }) => {
    const roomFromLocation = getRoomFromLocation(globalThis.location)
    const encryptionSupported = isEncryptionSupported()
    const [room, setRoom] = useState(
        roomFromLocation ??
            localStorage.getItem('spChatRoom') ??
            generateRandomRoom()
    )
    const [login, setLogin] = useState(
        localStorage.getItem('spChatLogin') ?? ''
    )
    const [password, setPassword] = useState(
        encryptionSupported
            ? (getPasswordFromLocation(globalThis.location) ?? '')
            : ''
    )

    const doLogin: onLoginType = useCallback(
        (userId, login, room, password) => {
            saveLoginInfo(login, room, password || undefined)
            onLogin?.(userId, login, room, password)
        },
        [onLogin]
    )

    useEffect(() => {
        if (roomFromLocation && isValidated(login, room)) {
            doLogin(userId, login, room, password)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // should only been done once

    const onLoginChange = (l: string) => {
        setLogin(clean(l))
    }
    const onRoomChange = (r: string) => {
        setRoom(clean(r))
    }

    const onSubmit: SubmitEventHandler = (e) => {
        e.preventDefault()
        if (isValidated(login, room)) doLogin(userId, login, room, password)
    }

    return (
        <div className={s.Home}>
            <h1 className={s.title}>Semi Persistent Chat</h1>
            <hr className={s.divider} />
            <form
                className={s.form}
                name="loginAndRoom"
                autoComplete="off"
                onSubmit={onSubmit}
            >
                <Login login={login} onLoginChange={onLoginChange} />
                <Room room={room} onRoomChange={onRoomChange} />
                <Password
                    password={password}
                    onPasswordChange={setPassword}
                    disabled={!encryptionSupported}
                />
                <input className={s.submit} type="submit" value="Login" />
            </form>
            <hr className={s.divider} />
            <p>
                Share the room name (or the URL once logged in) to your friends
                to chat together.
            </p>
            <p>
                With an optional password, messages (including images) are
                encrypted in your browser before being sent: the server only
                stores encrypted text. The password is kept in the URL (after
                the <code>#</code>), so sharing the link also shares the
                password with your friends.
            </p>
            <p>
                Messages will be deleted on server after{' '}
                {clientConfig.messageRetentionHours} hours.
            </p>
            <p>
                Without a password, do not use that service for confidential
                discussions.{' '}
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
