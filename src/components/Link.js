import React from 'react'
import './Link.css'

const imagesTypes = ['png', 'gif', 'webp', 'jpg', 'jpeg']

export default function Link(url) {
    const isImage = imagesTypes.find(
        (ext) => url.startsWith('https://') && url.endsWith(`.${ext}`)
    )
    return (
        <>
            {isImage && <img className="preview" src={url} alt="" />}
            <a href={url} target="blank" rel="nofollow noopener">
                {url}
            </a>
        </>
    )
}
