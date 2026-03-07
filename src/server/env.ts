import dotenv from 'dotenv'

dotenv.config()

export const MAX_MSG_SIZE = Number(process.env.MAX_MSG_SIZE ?? 500000)
export const MSG_RETENTION_HOURS = Number(process.env.MSG_RETENTION_HOURS ?? 1)
export const ORIGIN = process.env.ORIGIN ?? 'http://localhost/'
export const PORT = Number(process.env.PORT ?? 6060)
export const REDIS_HOST = process.env.REDIS_HOST ?? '127.0.0.1'
export const REDIS_PASSOWRD = process.env.REDIS_PASSWORD
export const REDIS_PORT = Number(process.env.REDIS_PORT ?? 6379)
export const SECRET = process.env.SECRET ?? ''
export const URL_CACHE = Number(process.env.URL_CACHE ?? 100)
export const IS_PROD = process.env.NODE_ENV === 'production'
