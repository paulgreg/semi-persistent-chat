import React from 'react'
import Link from './Link'
import Linkify from 'react-linkify'
import { isDataUrlImg } from '../media'
import { checkText } from 'smile2emoji'

export const hightlightSameUser = ({ login, message }) =>
    new RegExp(`\\b(${login})\\b`, 'gi').test(message) ? (
        <span className="MessageSameUser">{message}</span>
    ) : (
        message
    )

export default function Message({ login, message, validated }) {
    if (isDataUrlImg(message))
        return (
            <details open>
                <summary>Image</summary>
                <img className="preview" src={message} alt="" />
            </details>
        )

    const messageWithEjomi = checkText(message)

    return (
        <span
            className={`MessagesText ${validated ? '' : 'MessagesTextPending'}`}
        >
            <Linkify componentDecorator={Link}>
                {hightlightSameUser({ login, message: messageWithEjomi })}
            </Linkify>
        </span>
    )
}
