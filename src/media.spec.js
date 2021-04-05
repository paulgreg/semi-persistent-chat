const {
    isImage,
    isVideo,
    isAudio,
    mayUrlHaveATitle,
    isMedia,
    isDataUrlImg,
} = require('./media')

const images = [
    'https://upload.wikimedia.org/wikipedia/commons/9/9a/PNG_transparency_demonstration_2.png',
    'https://image.shutterstock.com/image-vector/large-number-mountains-vast-landscapes-260nw-1389573218.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/c/cc/ESC_large_ISS022_ISS022-E-11387-edit_01.JPG',
    'https://i1.wp.com/cynthiafrenette.com/wp-content/uploads/2019/12/dancing-birdie-smaller.gif',
    'https://i1.wp.com/cynthiafrenette.com/wp-content/uploads/2019/12/dancing-birdie-smaller.gif?fit=1500%2C1500&ssl=1',
]
const videos = [
    'http://techslides.com/demos/sample-videos/small.mp4',
    'http://techslides.com/demos/sample-videos/small.webm',
]
const audios = [
    'https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3',
    'https://file-examples-com.github.io/uploads/2017/11/file_example_WAV_1MG.wav',
    'https://file-examples-com.github.io/uploads/2017/11/file_example_OOG_1MG.ogg',
    'https://file-examples-com.github.io/uploads/2017/11/file_example_OOG_1MG.aac',
]
const pages = [
    'www.qwant.com',
    'https://rubular.com/',
    'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
    'https://some.url/a.mp3/mp3/mp4/gif/page.html',
]

describe('media', () => {
    describe('isImage', () => {
        images.forEach((url) =>
            test(`should return true for ${url}`, () =>
                expect(isImage(url)).toEqual(true))
        )
        ;[]
            .concat(videos)
            .concat(audios)
            .concat(pages)
            .forEach((url) =>
                test(`should return false for ${url}`, () =>
                    expect(isImage(url)).toEqual(false))
            )
    })
    describe('isVideo', () => {
        videos.forEach((url) =>
            test(`should return true for ${url}`, () =>
                expect(isVideo(url)).toEqual(true))
        )
        ;[]
            .concat(images)
            .concat(audios)
            .concat(pages)
            .forEach((url) =>
                test(`should return false for ${url}`, () =>
                    expect(isVideo(url)).toEqual(false))
            )
    })
    describe('isAudio', () => {
        audios.forEach((url) =>
            test(`should return true for ${url}`, () =>
                expect(isAudio(url)).toEqual(true))
        )
        ;[]
            .concat(videos)
            .concat(images)
            .concat(pages)
            .forEach((url) =>
                test(`should return false for ${url}`, () =>
                    expect(isAudio(url)).toEqual(false))
            )
    })

    describe('isMedia', () => {
        ;[]
            .concat(images)
            .concat(videos)
            .concat(audios)
            .forEach((url) =>
                test(`should return true for ${url}`, () =>
                    expect(isMedia(url)).toEqual(true))
            )
        pages.forEach((url) =>
            test(`should return false for ${url}`, () =>
                expect(isMedia(url)).toEqual(false))
        )
    })
    describe('mayUrlHaveATitle', () => {
        pages.forEach((url) =>
            test(`should return true for ${url}`, () =>
                expect(mayUrlHaveATitle(url)).toBe(true))
        )
        ;[undefined, '', 'mailto:test@example.com']
            .concat(images)
            .concat(audios)
            .concat(videos)
            .forEach((url) =>
                test(`should return false for ${url}`, () =>
                    expect(mayUrlHaveATitle(url)).toBe(false))
            )
    })
    describe('isDataUrlImg', () => {
        test('should return true for a data image url', () =>
            expect(isDataUrlImg('data:image/TEST')).toBe(true))
        ;[]
            .concat(images)
            .concat(audios)
            .concat(videos)
            .forEach((url) =>
                test(`should return false for ${url}`, () =>
                    expect(isDataUrlImg(url)).toBe(false))
            )
    })
})
