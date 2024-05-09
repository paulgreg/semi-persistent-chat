import React from 'react'
import './Link.css'
import AnchorTitleLink from './AnchorTitleLink'
import { isImage, isVideo, isAudio, isMedia } from '../media'

const AudioLink = ({ url }) => (
    <audio className="preview" src={url} controls="true" preload="none" />
)

const VideoLink = ({ url }) => (
    <video className="preview" src={url} controls="true" preload="none" />
)

const ImageLink = ({ url }) => <img className="preview" src={url} alt="" />

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
    if (isMedia(url)) {
        return (
            <DetailLink url={url}>
                {isImage(url) && <ImageLink url={url} />}
                {isVideo(url) && <VideoLink url={url} />}
                {isAudio(url) && <AudioLink url={url} />}
            </DetailLink>
        )
    }

    return <AnchorTitleLink url={url} key={url} />
}
