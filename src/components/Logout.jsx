import React, { useCallback } from 'react'
import './Logout.css'
import { disconnect } from '../services/communication'

export default function Logout({ room }) {
    const onClick = useCallback(() => {
        localStorage.removeItem('login')
        window.history.pushState({}, 'Chat', `./?room=${room}`)
        disconnect()
        window.location.reload()
    }, [room])

    return (
        <span className="Logout" onClick={onClick}>
            (<span className="LogoutText">logout</span>)
        </span>
    )
}
