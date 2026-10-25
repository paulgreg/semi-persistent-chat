const encoder = new TextEncoder()
const decoder = new TextDecoder('utf-8')

const PBKDF2_ITERATIONS = 1_000_000
const AES_KEY_BIT_LENGTH = 256
const SALT_SIZE = 16
const IV_SIZE = 12
const STRING_CONVERSION_CHUNK_SIZE = 8192

// Encrypted messages are stored in `text` as: enc:<salt>.<iv>.<content>
// (all base64 encoded). The prefix lets the client distinguish encrypted
// content from plain messages.
const ENVELOPE_PREFIX = 'enc:'
const ENVELOPE_SEPARATOR = '.'

const bufferSourceToUint8Array = (input: BufferSource) => {
    if (ArrayBuffer.isView(input)) {
        return new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
    }

    return new Uint8Array(input)
}

export const arrayBufferToString = (buf: BufferSource) => {
    const bytes = bufferSourceToUint8Array(buf)
    let str = ''

    for (let i = 0; i < bytes.length; i += STRING_CONVERSION_CHUNK_SIZE) {
        const chunk = bytes.subarray(i, i + STRING_CONVERSION_CHUNK_SIZE)
        str += String.fromCharCode(...chunk)
    }

    return str
}

export const arrayBufferToBase64 = (buf: BufferSource) =>
    globalThis.btoa(arrayBufferToString(buf))

export const stringToArrayBuffer = (str: string) => {
    const buf = new ArrayBuffer(str.length)
    const bufView = new Uint8Array(buf)
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i)
    }
    return buf
}

export const base64toArrayBuffer = (str: string) =>
    stringToArrayBuffer(globalThis.atob(str))

export const getRandomValues = (size = SALT_SIZE) =>
    globalThis.crypto.getRandomValues(new Uint8Array(size))

const getKeyFromPassword = (password: string, salt: BufferSource) =>
    globalThis.crypto.subtle
        .importKey('raw', encoder.encode(password), { name: 'PBKDF2' }, false, [
            'deriveBits',
            'deriveKey',
        ])
        .then((rawKey) =>
            globalThis.crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt,
                    iterations: PBKDF2_ITERATIONS,
                    hash: 'SHA-256',
                },
                rawKey,
                { name: 'AES-GCM', length: AES_KEY_BIT_LENGTH },
                false, // not extractible
                ['encrypt', 'decrypt']
            )
        )

// PBKDF2 (1M iterations) is expensive (~0.5s). Deriving a key per message
// would make decrypting a room history take minutes: keys are derived only
// once per password/salt pair and cached in memory (never persisted).
const keyCache = new Map<string, Promise<CryptoKey>>()

const getCachedKey = (password: string, saltInBase64: string) => {
    // base64 salts cannot contain '|' so the combined key is collision-free
    const cacheKey = `${saltInBase64}|${password}`
    let key = keyCache.get(cacheKey)
    if (!key) {
        key = getKeyFromPassword(password, base64toArrayBuffer(saltInBase64))
        keyCache.set(cacheKey, key)
        // allow a retry if the derivation failed
        key.catch(() => keyCache.delete(cacheKey))
    }
    return key
}

const encryptRaw = (key: CryptoKey, iv: BufferSource, input: BufferSource) =>
    globalThis.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, input)

const decryptRaw = (
    key: CryptoKey,
    iv: BufferSource,
    encryptedData: BufferSource
) =>
    globalThis.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedData
    )

// Salt used for every message sent during a session: generated once per page
// load so encryption costs a single key derivation. It travels with each
// message so recipients can derive the same key.
let outgoingSaltInBase64: string | undefined

export const isEncrypted = (text: string) =>
    typeof text === 'string' && text.startsWith(ENVELOPE_PREFIX)

export const encryptText = async (password: string, text: string) => {
    if (!password) throw new Error('no password provided')
    if (!outgoingSaltInBase64) {
        outgoingSaltInBase64 = arrayBufferToBase64(getRandomValues(SALT_SIZE))
    }
    const key = await getCachedKey(password, outgoingSaltInBase64)
    const iv = getRandomValues(IV_SIZE)
    const encryptedBuffer = await encryptRaw(key, iv, encoder.encode(text))
    return [
        ENVELOPE_PREFIX,
        outgoingSaltInBase64,
        arrayBufferToBase64(iv),
        arrayBufferToBase64(encryptedBuffer),
    ].join(ENVELOPE_SEPARATOR)
}

export const decryptText = async (password: string, encryptedText: string) => {
    if (!isEncrypted(encryptedText)) throw new Error('not encrypted content')
    if (!password) throw new Error('no password provided')
    const [prefix, saltInBase64, ivInBase64, contentInBase64] =
        encryptedText.split(ENVELOPE_SEPARATOR)
    if (
        prefix !== ENVELOPE_PREFIX ||
        !saltInBase64 ||
        !ivInBase64 ||
        !contentInBase64
    ) {
        throw new Error('malformed encrypted content')
    }
    const key = await getCachedKey(password, saltInBase64)
    const decryptedBuffer = await decryptRaw(
        key,
        base64toArrayBuffer(ivInBase64),
        base64toArrayBuffer(contentInBase64)
    )
    return decoder.decode(new Uint8Array(decryptedBuffer))
}

// crypto.subtle is only exposed in secure contexts (https or localhost):
// on a plain http origin, even a modern browser has no crypto.subtle
export const isEncryptionSupported = () =>
    !!globalThis.crypto && !!globalThis.crypto.subtle

// Ambiguous characters (0/O, 1/l/I) are excluded so the password stays readable
const PASSWORD_ALPHABET =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'

export const generateRandomPassword = (length = 32) => {
    const randomBytes = getRandomValues(length)
    let password = ''
    for (let i = 0; i < length; i++) {
        password += PASSWORD_ALPHABET[randomBytes[i] % PASSWORD_ALPHABET.length]
    }
    return password
}
