import { validateMessage, checkMessageValidity } from './validation'

describe('checkMessageValidity', () => {
    const CORRECT_MESSAGES = [
        {
            title: 'should return true if simple message if well formated',
            message: {
                user: 'user',
                room: 'room',
                message: 'msg',
            },
        },
        {
            title: `should return true if message with empty emojis if well formated`,
            message: {
                user: 'user',
                room: 'room',
                message: 'msg',
                emojis: [],
            },
        },
        {
            title: `should return true if message with emojis if well formated`,
            message: {
                user: 'user',
                room: 'room',
                message: 'msg',
                emojis: [
                    { user: 'a', emoji: '👍' },
                    { user: 'b', emoji: '👍' },
                ],
            },
        },
    ]

    CORRECT_MESSAGES.forEach(({ title, message }) =>
        it(title, () => expect(checkMessageValidity(message)).toBe(true))
    )
    const BAD_MESSAGES = [
        {
            title: 'message undefined',
            message: undefined,
        },
        {
            title: 'message empty',
            message: {},
        },
        {
            title: 'message has no user',
            message: {
                room: 'room',
                message: 'msg',
            },
        },
        {
            title: 'message has no room',
            message: {
                user: 'user',
                message: 'msg',
            },
        },
        {
            title: 'message has no message',
            message: {
                user: 'user',
                room: 'room',
            },
        },
        {
            title: 'message has empty user',
            message: {
                user: ' ',
                room: 'room',
                message: 'msg',
            },
        },
        {
            title: 'message has emojis object',
            message: {
                user: 'user',
                room: 'room',
                message: 'msg',
                emojis: {},
            },
        },
        {
            title: 'message has emojis object',
            message: {
                user: 'user',
                room: 'room',
                message: 'msg',
                emojis: [{ user: 'a' }],
            },
        },
    ]
    BAD_MESSAGES.forEach(({ message, title }) =>
        it(`should throw error if ${title}`, () =>
            expect(() => checkMessageValidity(message)).toThrow())
    )
})
describe('validateMessage', () => {
    it('validate correct message', () => {
        const m = validateMessage({
            uuid: 1,
            user: 'a',
            message: 'b',
            room: 'room',
        })
        expect(m).toMatchObject({
            uuid: '1',
            user: 'a',
            message: 'b',
            room: 'room',
            validated: true,
        })
        expect(m).toHaveProperty('timestamp')
    })

    it('should add uuid if missing', () => {
        expect(
            validateMessage({ user: 'user', room: 'room', message: 'msg' })
        ).toHaveProperty('uuid')
    })

    it('should trim user, room and message', () => {
        expect(
            validateMessage({
                user: '  user  ',
                room: '  room  ',
                message: '  msg  ',
            })
        ).toMatchObject({
            user: 'user',
            room: 'room',
            message: 'msg',
        })
    })

    it('should trucate user ', () => {
        expect(
            validateMessage({
                user: '1234567890-1234567890',
                room: 'room',
                message: 'msg',
            })
        ).toMatchObject({
            user: '1234567890',
        })
    })

    it('should throw error if no message ', () => {
        expect(() => validateMessage()).toThrow()
    })
})
