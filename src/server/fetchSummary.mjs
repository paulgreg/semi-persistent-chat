import axios from 'axios'
import * as cheerio from 'cheerio'
import { LRUCache } from 'lru-cache'
import { isProd } from '../configuration.mjs'
import config from '../config.mjs'
import { mayUrlHaveATitle } from '../media.mjs'

const MAX_TITLE_LENGTH = 1024

const addSummaryEndPoint = (app) => {
    const lruCacheConfig = { max: config.urlCache ?? 100 }
    console.log('url cache configuration', lruCacheConfig)
    const cache = new LRUCache(lruCacheConfig)

    const fetchSummary = (url) => {
        console.log(`fetchSummary(${url})`)
        return axios
            .get(encodeURI(url), {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
                },
                timeout: 5_000,
            })
            .then(function (response = {}) {
                const { status, data } = response
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
                if (!title) {
                    console.log(
                        'fetchSummary',
                        status,
                        '- no title found for',
                        url
                    )
                }
                return title
            })
            .catch((e = {}) => {
                const { response = {} } = e
                const { status } = response
                console.log('fetchSummary error', status, 'fetching', url)
                return undefined
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
            .then(() => {
                if (cache.has(url)) {
                    return cache.get(url)
                }
                return fetchSummary(url).then((title) => {
                    if (title?.length) cache.set(url, title)
                    return title
                })
            })
            .then((title) => {
                res.set('Cache-control', 'public, max-age=3600')
                res.status(200).json({
                    title,
                })
            })
            .catch((error = '') => {
                console.error(url, error.toString())
                res.status(503).end('503 Error')
            })
    })
}

export default addSummaryEndPoint
