import React, { ChangeEvent } from 'react'
import './Login.css'

type LoginType = {
    login: string
    onLoginChange: (v: string) => void
}

const Login: React.FC<LoginType> = ({ login, onLoginChange }) => {
    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const target = e.target
        onLoginChange?.(target.value)
    }

    return (
        <div className="login">
            <label htmlFor="login">Login : </label>
            <input
                id="login"
                type="text"
                placeholder="Superman"
                value={login}
                onChange={onChange}
                minLength={3}
                maxLength={10}
                autoFocus
            />
        </div>
    )
}

export default Login
