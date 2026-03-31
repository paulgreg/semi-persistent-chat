import * as cheerio from 'cheerio'
import { LRUCache } from 'lru-cache'
import { mayUrlHaveATitle } from '../media.js'
import jschardet from 'jschardet'
import charset from 'charset'
import iconv from 'iconv-lite'
import type { IncomingHttpHeaders } from 'node:http'
import type { Express } from 'express'
import { IS_PROD, SECRET, URL_CACHE } from './env.js'
import { isString } from '../components/strings.js'

const MAX_TITLE_LENGTH = 1024

const processResponse = async (response: Response) => {
    const { status, headers } = response
    if (status < 200 || status >= 300) {
        throw new Error('bad status')
    }
    const contentType = headers.get('content-type')
    if (!contentType?.includes('text/html')) {
        throw new Error('not an HTML page')
    }

    const data = await response.arrayBuffer()
    const chardetResult = jschardet.detect(Buffer.from(data))
    const encoding =
        chardetResult?.encoding ??
        charset(headers as unknown as IncomingHttpHeaders, Buffer.from(data)) ??
        'UTF-8'
    return iconv.decode(Buffer.from(data), encoding)
}

const addSummaryEndPoint = (app: Express) => {
    const lruCacheConfig = { max: URL_CACHE }
    console.log('url cache configuration', lruCacheConfig)
    const cache = new LRUCache(lruCacheConfig)

    const fetchSummary = async (url: string) => {
        console.log(`fetchSummary(${url})`)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5_000)

        try {
            const response = await fetch(encodeURI(url), {
                method: 'GET',
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
                },
                signal: controller.signal,
            })

            clearTimeout(timeoutId)
            const data = await processResponse(response)

            const $ = cheerio.load(data, {
                xmlMode: false,
            })
            const titleFromPage =
                $('head title').text() || $('body title').text()
            const title = String(titleFromPage).substring(0, MAX_TITLE_LENGTH)

            if (!title) {
                console.log(
                    'fetchSummary',
                    response.status,
                    '- no title found for',
                    url
                )
            }
            return title
        } catch (err: unknown) {
            const e = err as Error
            clearTimeout(timeoutId)
            console.log('fetchSummary error', e.message, 'fetching', url)
            return undefined
        }
    }

    app.get('/api/fetchSummary', (req, res) => {
        let error = false

        if (req.query.auth !== SECRET) {
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
            if (IS_PROD) {
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
                .then(async () => {
                    if (cache.has(urlStr)) {
                        return cache.get(urlStr)
                    }
                    const title = await fetchSummary(urlStr)
                    if (title?.length) cache.set(urlStr, title)
                    return title
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
