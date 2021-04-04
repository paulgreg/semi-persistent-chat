import React from 'react'
import { IMAGE_TYPES, AUDIO_TYPES, VIDEO_TYPES } from './media.constants'
import './Link.css'
import AnchorTitleLink from './AnchorTitleLink'

const isValidMedia = (types) => (url) =>
    types.find((ext) =>
        new RegExp(`http(s?)://(?:.*)\\.(?:${ext})(\\?.*)?$`, 'gi').test(url)
    ) !== undefined

export const isImageFn = isValidMedia(IMAGE_TYPES)
export const isVideoFn = isValidMedia(VIDEO_TYPES)
export const isAudioFn = isValidMedia(AUDIO_TYPES)

const AudioLink = ({ url }) => (
    <audio className="preview" src={url} controls="true" preload="none" />
)

const VideoLink = ({ url }) => (
    <video className="preview" src={url} controls="true" preload="none" />
)

const ImgLink = ({ url }) => <img className="preview" src={url} alt="" />

const DetailLink = ({ url, children }) => {
    return (
        <details open>
            <summary>
                <a href={url} target="blank" rel="nofollow noopener">
                    {url}
                </a>
            </summary>
            {children}
        </details>
    )
}

export default function Link(url) {
    const isImage = isImageFn(url)
    const isVideo = isVideoFn(url)
    const isAudio = isAudioFn(url)

    if (isImage || isVideo || isAudio) {
        return (
            <DetailLink url={url}>
                {isImage && <ImgLink url={url} />}
                {isVideo && <VideoLink url={url} />}
                {isAudio && <AudioLink url={url} />}
            </DetailLink>
        )
    }

    return <AnchorTitleLink url={url} />
}
