import './Room.css'
import React from 'react'

export default function Room(props) {
    function onChange(e) {
        props.onRoomChange && props.onRoomChange(e.target.value)
    }

    return (
        <div className="room">
            <label className="roomLabel" htmlFor="room">
                Room name :{' '}
            </label>
            <input
                name="room"
                type="text"
                placeholder="alphanumeric room name"
                value={props.room}
                onChange={onChange}
                minLength="3"
                maxLength="10"
            />
        </div>
    )
}
