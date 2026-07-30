import React, { ChangeEvent, useCallback } from 'react'
import s from './Room.module.css'
import sCommon from './Common.module.css'

type RoomType = {
    room: string
    onRoomChange?: (name: string) => void
}

const Room: React.FC<RoomType> = ({ room, onRoomChange }) => {
    const onChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => onRoomChange?.(e.target.value),
        [onRoomChange]
    )

    return (
        <div className={s.room}>
            <label className={sCommon.fieldLabel} htmlFor="room">
                Room :
            </label>
            <input
                id="room"
                type="text"
                placeholder="alphanumeric room name"
                value={room}
                onChange={onChange}
                minLength={3}
                maxLength={10}
            />
        </div>
    )
}

export default Room
