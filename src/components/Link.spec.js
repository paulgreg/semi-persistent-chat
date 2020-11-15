const { isImageFn, isVideoFn, isAudioFn } = require('./Link')

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
    'https://rubular.com/',
    'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
    'https://some.url/a.mp3/mp3/mp4/gif/page.html',
]

describe('Link', () => {
    describe('isImageFn', () => {
        images.forEach((url) =>
            test(`should return true for ${url}`, () =>
                expect(isImageFn(url)).toEqual(true))
        )
        videos.forEach((url) =>
            test(`should return false for ${url}`, () =>
                expect(isImageFn(url)).toEqual(false))
        )
        audios.forEach((url) =>
            test(`should return false for ${url}`, () =>
                expect(isImageFn(url)).toEqual(false))
        )
        pages.forEach((url) =>
            test(`should return false for ${url}`, () =>
                expect(isImageFn(url)).toEqual(false))
        )
    })
    describe('isVideoFn', () => {
        videos.forEach((url) =>
            test(`should return true for ${url}`, () =>
                expect(isVideoFn(url)).toEqual(true))
        )
        images.forEach((url) =>
            test(`should return false for ${url}`, () =>
                expect(isVideoFn(url)).toEqual(false))
        )
        audios.forEach((url) =>
            test(`should return false for ${url}`, () =>
                expect(isVideoFn(url)).toEqual(false))
        )
        pages.forEach((url) =>
            test(`should return false for ${url}`, () =>
                expect(isVideoFn(url)).toEqual(false))
        )
    })
    describe('isAudioFn', () => {
        audios.forEach((url) =>
            test(`should return true for ${url}`, () =>
                expect(isAudioFn(url)).toEqual(true))
        )
        videos.forEach((url) =>
            test(`should return false for ${url}`, () =>
                expect(isAudioFn(url)).toEqual(false))
        )
        images.forEach((url) =>
            test(`should return false for ${url}`, () =>
                expect(isAudioFn(url)).toEqual(false))
        )
        pages.forEach((url) =>
            test(`should return false for ${url}`, () =>
                expect(isAudioFn(url)).toEqual(false))
        )
    })
})
