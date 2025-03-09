import './Link.css'
import AnchorTitleLink from './AnchorTitleLink'
import { isImage, isVideo, isAudio, isMedia } from '../media'
import { ReactNode } from 'react'

type LinkType = {
    url: string
}

const AudioLink: React.FC<LinkType> = ({ url }) => (
    <audio className="preview" src={url} controls={true} preload="none" />
)

const VideoLink: React.FC<LinkType> = ({ url }) => (
    <video className="preview" src={url} controls={true} preload="none" />
)

const ImageLink: React.FC<LinkType> = ({ url }) => (
    <img className="preview" src={url} alt="" />
)

const DetailLink: React.FC<{ url: string; children: ReactNode }> = ({
    url,
    children,
}) => {
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

const Link = (url: string) => {
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
