import s from './Link.module.css'
import AnchorTitleLink from './AnchorTitleLink'
import { isImage, isVideo, isAudio, isMedia } from '../media'
import React, { ReactNode } from 'react'

type LinkType = {
    url: string
}

const AudioLink: React.FC<LinkType> = ({ url }) => (
    <audio className={s.preview} src={url} controls={true} preload="none" />
)

const VideoLink: React.FC<LinkType> = ({ url }) => (
    <video className={s.preview} src={url} controls={true} preload="none" />
)

const ImageLink: React.FC<LinkType> = ({ url }) => (
    <img className={s.preview} src={url} alt="" />
)

const DetailLink: React.FC<{ url: string; children: ReactNode }> = ({
    url,
    children,
}) => {
    return (
        <details open>
            <summary>
                <a
                    href={url}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                >
                    {url}
                </a>
            </summary>
            {children}
        </details>
    )
}

type LinkComponentProps = {
    attributes: Record<string, string>
    content: string
}

const Link: React.FC<LinkComponentProps> = ({ attributes, content }) => {
    const url = attributes.href || content

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

export default Link
