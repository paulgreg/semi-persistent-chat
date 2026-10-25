import {
    arrayBufferToBase64,
    base64toArrayBuffer,
    decryptText,
    encryptText,
    generateRandomPassword,
    getRandomValues,
    isEncrypted,
    isEncryptionSupported,
} from './crypto'

describe('crypto', () => {
    describe('base64 conversions', () => {
        test('should round-trip binary content', () => {
            const bytes = new Uint8Array([0, 255, 123, 56, 8, 19, 200])
            const base64 = arrayBufferToBase64(bytes.buffer)
            expect(new Uint8Array(base64toArrayBuffer(base64))).toEqual(bytes)
        })
    })

    describe('getRandomValues', () => {
        test('should return the requested number of random bytes', () => {
            expect(getRandomValues()).toHaveLength(16)
            expect(getRandomValues(12)).toHaveLength(12)
        })
    })

    describe('isEncryptionSupported', () => {
        test('should be true in the test environment (webcrypto polyfill)', () => {
            expect(isEncryptionSupported()).toBe(true)
        })
    })

    describe('generateRandomPassword', () => {
        test('should generate a 32 chars password by default', () => {
            const password = generateRandomPassword()
            expect(password).toHaveLength(32)
            expect(password).toMatch(/^[A-Za-z23456789]{32}$/)
        })
        test('should generate different passwords each time', () => {
            expect(generateRandomPassword()).not.toEqual(
                generateRandomPassword()
            )
        })
    })

    describe('encryptText / decryptText', () => {
        const password = 'password12345'

        test('should encrypt then decrypt back to the original message', async () => {
            const original = 'Hello World !'
            const encrypted = await encryptText(password, original)
            expect(encrypted).not.toEqual(original)
            expect(encrypted).toMatch(/^enc:/)
            expect(await decryptText(password, encrypted)).toEqual(original)
        })

        test('should encrypt and decrypt a data url image (binary as text)', async () => {
            const dataUrl =
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
            const encrypted = await encryptText(password, dataUrl)
            expect(isEncrypted(encrypted)).toBe(true)
            expect(await decryptText(password, encrypted)).toEqual(dataUrl)
        })

        test('should fail decryption with a wrong password', async () => {
            const encrypted = await encryptText(password, 'secret')
            await expect(
                decryptText('otherPassword', encrypted)
            ).rejects.toBeDefined()
        })

        test('should fail decryption without a password', async () => {
            const encrypted = await encryptText(password, 'secret')
            await expect(decryptText('', encrypted)).rejects.toBeDefined()
        })

        test('should fail encryption without a password', async () => {
            await expect(encryptText('', 'secret')).rejects.toBeDefined()
        })

        test('should fail on malformed encrypted content', async () => {
            await expect(
                decryptText(password, 'enc:badcontent')
            ).rejects.toBeDefined()
        })
    })

    describe('isEncrypted', () => {
        test('should not detect plain content as encrypted', () => {
            expect(isEncrypted('Hello World !')).toBe(false)
            expect(isEncrypted('data:image/png;base64,AAA')).toBe(false)
        })
    })
})
