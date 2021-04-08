const axios = require('axios')
const cheerio = require('cheerio')
const LRU = require('lru-cache')
const { isProd } = require('../configuration')
const { mayUrlHaveATitle } = require('../media')

const MAX_TITLE_LENGTH = 1024

const addSummaryEndPoint = (app) => {
    const cache = new LRU({ max: 100 })

    const fetchSummary = (url) => {
        console.log(`fetch ${url}`)
        return axios
            .get(encodeURI(url), {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
                },
            })
            .then(function (response = {}) {
                const { status, data } = response
                if (status === 200) {
                    const $ = cheerio.load(data, {
                        normalizeWhitespace: true,
                        xmlMode: false,
                        decodeEntities: true,
                    })
                    const titleFromPage =
                        $('head title').text() || $('body title').text()
                    const title = String(titleFromPage).substring(
                        0,
                        MAX_TITLE_LENGTH
                    )
                    return title
                }
            })
            .catch((e = {}) => {
                const { response = {} } = e
                const { status } = response
                if (status === 404) {
                    console.log(url, status)
                    return undefined
                } else {
                    console.log('error')
                    throw e
                }
            })
    }

    app.get('/api/fetchSummary', (req, res) => {
        const url = req.query.url
        if (!url) return res.status(404).end('404 Missing url parameter')

        if (!mayUrlHaveATitle(url)) {
            console.error('URL doesn’t seems to have a title')
            res.status(404).end('404 No title')
        }

        if (isProd()) {
            const origin = req.header('origin')
            if (origin) {
                // an origin means a request from another web site, so rejecting it
                console.error(`request from origin (${origin})`)
                return res.status(401).end('401 Unauthorized')
            }
        } else {
            // on dev, we’re using different port, so header is needed
            res.header('Access-Control-Allow-Origin', '*')
        }

        return Promise.resolve()
            .then(() => (cache.has(url) ? cache.get(url) : fetchSummary(url)))
            .then((title) => {
                if (!title) {
                    res.status(404).end('404 No title')
                } else {
                    cache.set(url, title)
                    res.set('Cache-control', 'public, max-age=3600')
                    res.status(200).json({
                        title,
                    })
                }
            })
            .catch(function (error = '') {
                console.error(url, error.toString())
                res.status(503).end('503 Error')
            })
    })
}

module.exports = addSummaryEndPoint
