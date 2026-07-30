import React, { useCallback } from 'react'
import { removeLoginInfoAndGoBackToHome } from '../services/utils'
import s from './Logout.module.css'

type LogoutType = {
    room: string
}

const Logout: React.FC<LogoutType> = ({ room }) => {
    const onClick = useCallback(() => {
        removeLoginInfoAndGoBackToHome(room)
    }, [room])

    return (
        <button className={s.Logout} type="button" onClick={onClick}>
            (<span className={s.LogoutText}>logout</span>)
        </button>
    )
}

export default Logout
