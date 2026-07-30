import React, { useCallback, useState } from 'react'
import Logout from './Logout'
import { UsersType } from '../types/ChatTypes'
import s from './UsersList.module.css'

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
            <div className={`${s.UsersList} ${visible ? s.UsersVisible : ''}`}>
                <div className={s.UsersListContent}>
                    <p className={s.UsersListTitle}>Connected users :</p>
                    <ul className={s.UsersUl}>
                        {users.map((m) => (
                            <li key={m.userId}>
                                {m.userId === userId ? (
                                    <>
                                        <span
                                            className={s.higlight}
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
            <button
                className={`${s.UsersCount} ${visible ? s.UsersCountVisible : ''}`}
                title="Users"
                onClick={onClick}
            >
                <span className={s.UsersCountText}>
                    {users.length}{' '}
                    <span
                        className={s.UsersCountIcon}
                        role="img"
                        aria-label="users"
                    >
                        👪
                    </span>
                </span>
            </button>
        </>
    )
}

export default UsersList
