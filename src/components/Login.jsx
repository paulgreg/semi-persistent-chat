import './Login.css'
import React from 'react'

export default function Login(props) {
    function onChange(e) {
        props.onLoginChange && props.onLoginChange(e.target.value)
    }

    return (
        <div className="login">
            <label htmlFor="login">Login : </label>
            <input
                id="login"
                type="text"
                placeholder="Superman"
                value={props.login}
                onChange={onChange}
                minLength="3"
                maxLength="10"
                autoFocus
            />
        </div>
    )
}
