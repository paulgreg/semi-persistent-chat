const axios = require('axios')
const cheerio = require('cheerio')
const LRU = require('lru-cache')
const { isProd } = require('../configuration')

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
                    const title = String($('head title').text()).substring(
                        0,
                        MAX_TITLE_LENGTH
                    )
                    cache.set(url, title)
                    return title
                }
            })
    }

    app.get('/api/fetchSummary', (req, res) => {
        const url = req.query.url

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

        if (!url) return res.status(404).end('404 Missing url parameter')

        return Promise.resolve()
            .then(() => {
                if (cache.has(url)) return cache.get(url)
                else return fetchSummary(url)
            })
            .then((title) => {
                res.set('Cache-control', 'public, max-age=3600')
                res.status(200).json({
                    title,
                })
            })
            .catch(function (error) {
                console.error(error, url)
                res.status(503).send('503 Error')
            })
    })
}

module.exports = addSummaryEndPoint
