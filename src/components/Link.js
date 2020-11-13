import React from 'react'
import './Link.css'

const imagesTypes = ['png', 'gif', 'webp', 'jpg', 'jpeg', 'svg']
const videoTypes = ['mp4', 'webm']
const audioTypes = ['mp3', 'ogg', 'wav', 'aac', 'flac']

const isValidMedia = (types) => (url) =>
    types.find((ext) => url.startsWith('https://') && url.endsWith(`.${ext}`))

export default function Link(url) {
    const isImage = isValidMedia(imagesTypes)(url)
    const isVideo = isValidMedia(videoTypes)(url)
    const isAudio = isValidMedia(audioTypes)(url)
    return (
        <>
            {isImage && <img className="preview" src={url} alt="" />}
            {isVideo && (
                <video
                    className="preview"
                    src={url}
                    controls="true"
                    preload="none"
                />
            )}
            {isAudio && (
                <audio
                    className="preview"
                    src={url}
                    controls="true"
                    preload="none"
                />
            )}
            <a href={url} target="blank" rel="nofollow noopener">
                {url}
            </a>
        </>
    )
}
