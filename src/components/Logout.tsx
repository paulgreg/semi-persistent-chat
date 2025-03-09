import React, { useCallback } from 'react'
import { removeLoginInfoAndGoBackToHome } from '../services/utils'
import './Logout.css'

type LogoutType = {
    room: string
}

const Logout: React.FC<LogoutType> = ({ room }) => {
    const onClick = useCallback(() => {
        removeLoginInfoAndGoBackToHome(room)
    }, [room])

    return (
        <span className="Logout" onClick={onClick}>
            (<span className="LogoutText">logout</span>)
        </span>
    )
}

export default Logout
