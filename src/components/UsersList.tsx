import React, { useCallback, useState } from 'react'
import Logout from './Logout'
import { UsersType } from '../types/ChatTypes'
import './UsersList.css'

type UsersListType = {
    userId: string
    users: UsersType
    room: string
}

const UsersList: React.FC<UsersListType> = ({ userId, users, room }) => {
    const [visible, setVisible] = useState(false)

    const onClick = useCallback(() => setVisible(!visible), [visible])

    return (
        <>
            <div className={`UsersList ${visible && 'UsersVisible'}`}>
                <div className="UsersListContent">
                    <p className="UsersListTitle">Connected users :</p>
                    <ul className="UsersUl">
                        {users.map((m) => (
                            <li key={m.userId}>
                                {m.userId === userId ? (
                                    <>
                                        <span
                                            className="higlight"
                                            title={m.userId}
                                        >
                                            {m.username}
                                        </span>
                                        <Logout room={room} />
                                    </>
                                ) : (
                                    <span title={m.userId}>{m.username}</span>
                                )}
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

export default UsersList
