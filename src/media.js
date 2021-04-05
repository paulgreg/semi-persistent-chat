const IMAGE_TYPES = ['png', 'gif', 'webp', 'jpg', 'jpeg', 'svg']
const VIDEO_TYPES = ['mp4', 'webm']
const AUDIO_TYPES = ['mp3', 'ogg', 'wav', 'aac', 'flac']

const DATA_URL_IMG_PREFIX = 'data:image/'

const isValidMedia = (types) => (url) =>
    types.find((ext) =>
        new RegExp(`http(s?)://(?:.*)\\.(?:${ext})(\\?.*)?$`, 'gi').test(url)
    ) !== undefined

const isImage = isValidMedia(IMAGE_TYPES)
const isVideo = isValidMedia(VIDEO_TYPES)
const isAudio = isValidMedia(AUDIO_TYPES)

const isMedia = (url) => isImage(url) || isVideo(url) || isAudio(url)

const isDataUrlImg = (url = '') => url.startsWith(DATA_URL_IMG_PREFIX)

const mayUrlHaveATitle = (url) => {
    if (!url) return false
    if (url.startsWith('mailto:')) return false
    if (isMedia(url)) return false
    return true
}

module.exports = {
    isDataUrlImg,
    isImage,
    isAudio,
    isVideo,
    isMedia,
    mayUrlHaveATitle,
}
