import { useEffect, useState } from 'react'
import { mayUrlHaveATitle } from '../media'
import { clientConfig } from '../services/clientConfig'
import './AnchorTitleLink.css'

type AnchorTitleLinkType = {
    url: string
}

const AnchorTitleLink: React.FC<AnchorTitleLinkType> = ({ url }) => {
    const [title, setTitle] = useState<string | undefined>()

    const fetchTitle = async (url: string) => {
        try {
            const response = await fetch(
                `./api/fetchSummary?auth=${clientConfig.secret}&url=${url}`
            )
            if (response.status === 200) {
                const json = await response.json()
                setTitle(json?.title)
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

export default AnchorTitleLink
