import React from 'react'
import { IMAGE_TYPES, AUDIO_TYPES, VIDEO_TYPES } from './media.constants'
import './Link.css'

const isValidMedia = (types) => (url) =>
    types.find((ext) =>
        new RegExp(`http(s?)://(?:.*)\\.(?:${ext})(\\?.*)?$`, 'gi').test(url)
    ) !== undefined

export const isImageFn = isValidMedia(IMAGE_TYPES)
export const isVideoFn = isValidMedia(VIDEO_TYPES)
export const isAudioFn = isValidMedia(AUDIO_TYPES)

export default function Link(url) {
    const isImage = isValidMedia(IMAGE_TYPES)(url)
    const isVideo = isValidMedia(VIDEO_TYPES)(url)
    const isAudio = isValidMedia(AUDIO_TYPES)(url)
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
