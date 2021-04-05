import React, { useEffect, useState } from 'react'
import './AnchorTitleLink.css'
import { port } from '../config.json'
import { isProd } from '../configuration.js'
import { mayUrlHaveATitle } from '../media'

const baseUrl = isProd() ? '.' : `http://localhost:${port}`

export default function AnchorTitleLink({ url }) {
    const [title, setTitle] = useState()

    const fetchTitle = async (url) => {
        const response = await fetch(`${baseUrl}/api/fetchSummary?url=${url}`)
        const json = await response.json()
        setTitle(json && json.title)
    }

    useEffect(() => {
        if (mayUrlHaveATitle(url)) fetchTitle(url)
    }, [url])

    return (
        <>
            <a href={url} target="blank" rel="nofollow noopener">
                {url}
            </a>
            {title && (
                <>
                    {' '}
                    (<span className="linkTitle">{title}</span>)
                </>
            )}
        </>
    )
}
