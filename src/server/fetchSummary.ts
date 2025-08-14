import axios, { AxiosResponse } from 'axios'
import * as cheerio from 'cheerio'
import { LRUCache } from 'lru-cache'
import { isProd } from '../configuration.js'
import settings from '../settings.json'
import { mayUrlHaveATitle } from '../media.js'
import jschardet from 'jschardet'
import charset from 'charset'
import iconv from 'iconv-lite'
import type { IncomingHttpHeaders } from 'http'
import type { Express } from 'express'
import { isString } from './validation.js'

const MAX_TITLE_LENGTH = 1024

axios.interceptors.response.use((response: AxiosResponse) => {
    const { status, headers, data } = response ?? {}
    if (status < 200 || status >= 300) {
        throw new Error('bad status')
    }
    if (!headers['content-type'].includes('text/html')) {
        throw new Error('not an HTML page')
    }
    if (data) {
        const chardetResult = jschardet.detect(data)
        const encoding =
            chardetResult?.encoding ??
            charset(headers as IncomingHttpHeaders, data) ??
            'UTF-8'
        response.data = iconv.decode(data, encoding)
    }
    return response
})

const addSummaryEndPoint = (app: Express) => {
    const lruCacheConfig = { max: settings.urlCache ?? 100 }
    console.log('url cache configuration', lruCacheConfig)
    const cache = new LRUCache(lruCacheConfig)

    const fetchSummary = (url: string) => {
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
            .then(function (response: AxiosResponse) {
                const { status, data } = response ?? {}
                const $ = cheerio.load(data, {
                    xmlMode: false,
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
                const { response = {}, message } = e
                const { status } = response
                console.log(
                    'fetchSummary error',
                    message,
                    '- status:',
                    status,
                    'fetching',
                    url
                )
                return undefined
            })
    }

    app.get('/api/fetchSummary', (req, res) => {
        let error = false

        if (req.query.auth !== settings.secret) {
            error = true
            console.error('summary api: client uses bad auth')
            res.status(401).end('401 Unauthorized')
        }

        const url = req.query.url
        if (!isString(url)) {
            error = true
            res.status(404).end('404 Missing url parameter')
        }
        const urlStr = url as string

        if (!error && !mayUrlHaveATitle(urlStr)) {
            error = true
            console.error('URL doesn’t seems to have a title')
            res.status(404).end('404 No title')
        }

        if (!error) {
            if (isProd()) {
                const origin = req.header('origin')
                if (origin) {
                    // an origin means a request from another web site, so rejecting it
                    error = true
                    console.error(`request from origin (${origin})`)
                    res.status(401).end('401 Unauthorized')
                }
            } else {
                // on dev, we’re using different port, so header is needed
                res.header('Access-Control-Allow-Origin', '*')
            }
        }

        if (!error) {
            Promise.resolve()
                .then(() => {
                    if (cache.has(urlStr)) {
                        return cache.get(urlStr)
                    }
                    return fetchSummary(urlStr).then((title) => {
                        if (title?.length) cache.set(urlStr, title)
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
        }
    })
}

export default addSummaryEndPoint
