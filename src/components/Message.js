import React from 'react'
import Link from './Link'
import Linkify from 'react-linkify'
import { DATA_URL_IMG_PREFIX } from './media.constants'

function hightlightSameUser({ login, message }) {
    return message.includes(login) ? (
        <span className="MessageSameUser">{message}</span>
    ) : (
        message
    )
}

export default function Message({ login, message }) {
    if (message.startsWith(DATA_URL_IMG_PREFIX))
        return (
            <>
                <img className="preview" src={message} alt="" />
            </>
        )

    return (
        <span className="MessagesText">
            <Linkify componentDecorator={Link}>
                {hightlightSameUser({ login, message })}
            </Linkify>
        </span>
    )
}
