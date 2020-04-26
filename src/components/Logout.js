import React from 'react'
import './Logout.css'
import { disconnect } from '../services/communication'

export default function Logout(props) {
    function onClick(e) {
        localStorage.removeItem('login')
        window.history.pushState({}, 'Chat', './')
        disconnect()
        window.location.reload()
    }

    return (
        <span className="Logout" onClick={onClick}>
            (<span className="LogoutText">logout</span>)
        </span>
    )
}
