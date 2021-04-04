import React from 'react'
import Link from './Link'
import Linkify from 'react-linkify'
import { DATA_URL_IMG_PREFIX } from './media.constants'

export const hightlightSameUser = ({ login, message }) =>
    new RegExp(`\\b(${login})\\b`, 'gi').test(message) ? (
        <span className="MessageSameUser">{message}</span>
    ) : (
        message
    )

export default function Message({ login, message }) {
    if (message.startsWith(DATA_URL_IMG_PREFIX))
        return (
            <details open>
                <summary>Image</summary>
                <img className="preview" src={message} alt="" />
            </details>
        )

    return (
        <span className="MessagesText">
            <Linkify componentDecorator={Link}>
                {hightlightSameUser({ login, message })}
            </Linkify>
        </span>
    )
}
