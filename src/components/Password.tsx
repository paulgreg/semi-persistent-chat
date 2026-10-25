import React, { ChangeEvent, useCallback } from 'react'
import { generateRandomPassword } from '../services/crypto'
import sCommon from './Common.module.css'
import s from './Password.module.css'

const PASSWORD_LENGTH = 32

type PasswordType = {
    password: string
    onPasswordChange: (v: string) => void
    disabled?: boolean
}

const Password: React.FC<PasswordType> = ({
    password,
    onPasswordChange,
    disabled,
}) => {
    const onChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) =>
            onPasswordChange?.(e.target.value),
        [onPasswordChange]
    )

    const onGenerate = useCallback(
        () => onPasswordChange?.(generateRandomPassword(PASSWORD_LENGTH)),
        [onPasswordChange]
    )

    return (
        <div className={s.password}>
            <label className={sCommon.fieldLabel} htmlFor="password">
                Password :
            </label>
            <input
                id="password"
                type="text"
                placeholder="optional encryption password"
                value={password}
                onChange={onChange}
                spellCheck="false"
                autoComplete="new-password"
                maxLength={100}
                disabled={disabled}
            />
            <button
                type="button"
                className={s.generate}
                onClick={onGenerate}
                disabled={disabled}
                title={`Generate a random password of ${PASSWORD_LENGTH} characters`}
            >
                🎲
            </button>
            {disabled && (
                <span className={s.unsupported}>
                    encryption unavailable (requires HTTPS)
                </span>
            )}
        </div>
    )
}

export default Password
