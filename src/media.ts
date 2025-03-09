const IMAGE_TYPES = ['png', 'gif', 'webp', 'jpg', 'jpeg', 'svg']
const VIDEO_TYPES = ['mp4', 'webm']
const AUDIO_TYPES = ['mp3', 'ogg', 'wav', 'aac', 'flac']

const DATA_URL_IMG_PREFIX = 'data:image/'

const isValidMedia = (types: Array<string>) => (url: string) =>
    types.find((ext) =>
        new RegExp(`http(s?)://(?:.*)\\.(?:${ext})(\\?.*)?$`, 'gi').test(url)
    ) !== undefined

export const isImage = isValidMedia(IMAGE_TYPES)
export const isVideo = isValidMedia(VIDEO_TYPES)
export const isAudio = isValidMedia(AUDIO_TYPES)

export const isMedia = (url: string) =>
    isImage(url) || isVideo(url) || isAudio(url)

export const isDataUrlImg = (url: string) => url.startsWith(DATA_URL_IMG_PREFIX)

export const mayUrlHaveATitle = (url?: string) => {
    if (!url || Array.isArray(url)) return false
    if (url.startsWith('mailto:')) return false
    if (isMedia(url)) return false
    return true
}
