import React, { useEffect, useState } from 'react'
import './AnchorTitleLink.css'
import { port } from '../config.json'
import { isProd } from '../configuration.js'
import { mayUrlHaveATitle } from '../media'

const baseUrl = isProd() ? '.' : `http://localhost:${port}`

export default function AnchorTitleLink({ url }) {
    const [title, setTitle] = useState()

    const fetchTitle = async (url) => {
        try {
            const response = await fetch(
                `${baseUrl}/api/fetchSummary?url=${url}`
            )
            if (response.status === 200) {
                const json = await response.json()
                setTitle(json && json.title)
            }
        } catch (e) {
            console.warn(`failed to load title for ${url}`, e)
        }
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
