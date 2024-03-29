import React, { useState } from 'react'
import Logout from './Logout'
import './Users.css'

export default function Users({ users, login, room }) {
    const [visible, setVisible] = useState(false)

    const onClick = (e) => setVisible(!visible)

    const hightlightYourself = (username) =>
        username === login ? (
            <>
                <span className="UsersYourself">{username}</span>
                <Logout room={room} />
            </>
        ) : (
            username
        )

    return (
        <>
            <div className={`UsersList ${visible && 'UsersVisible'}`}>
                <div className="UsersListContent">
                    <p className="UsersListTitle">Connected users :</p>
                    <ul className="UsersUl">
                        {users.map((username) => (
                            <li key={username}>
                                {hightlightYourself(username)}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div
                className={`UsersCount ${visible && 'UsersCountVisible'}`}
                title="Users"
                onClick={onClick}
            >
                <span className="UsersCountText">
                    {users.length}{' '}
                    <span
                        className="UsersCountIcon"
                        role="img"
                        aria-label="users"
                    >
                        👪
                    </span>
                </span>
            </div>
        </>
    )
}
