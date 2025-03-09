import { validateMessage, checkMessageValidity } from './validation'

describe('checkMessageValidity', () => {
    const CORRECT_MESSAGES = [
        {
            title: 'should return true if simple message if well formated',
            message: {
                username: 'username',
                room: 'room',
                text: 'msg',
            },
        },
        {
            title: `should return true if message with empty emojis if well formated`,
            message: {
                username: 'username',
                room: 'room',
                text: 'msg',
                emojis: [],
            },
        },
        {
            title: `should return true if message with emojis if well formated`,
            message: {
                username: 'username',
                room: 'room',
                text: 'msg',
                emojis: [
                    { username: 'a', emoji: '👍' },
                    { username: 'b', emoji: '👍' },
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
                text: 'msg',
            },
        },
        {
            title: 'message has no room',
            message: {
                username: 'username',
                text: 'msg',
            },
        },
        {
            title: 'message has no message',
            message: {
                username: 'username',
                room: 'room',
            },
        },
        {
            title: 'message has empty username',
            message: {
                username: ' ',
                room: 'room',
                text: 'msg',
            },
        },
        {
            title: 'message has emojis object',
            message: {
                username: 'username',
                room: 'room',
                text: 'msg',
                emojis: {},
            },
        },
        {
            title: 'message has emojis object',
            message: {
                username: 'username',
                room: 'room',
                text: 'msg',
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
            msgId: 1,
            username: 'b',
            text: 'c',
            room: 'room',
        })
        expect(m).toMatchObject({
            msgId: '1',
            username: 'b',
            text: 'c',
            room: 'room',
            validated: true,
        })
        expect(m).toHaveProperty('timestamp')
    })

    it('should add msgId if missing', () => {
        expect(
            validateMessage({
                username: 'username',
                room: 'room',
                text: 'msg',
            })
        ).toHaveProperty('msgId')
    })

    it('should trim user, room and message', () => {
        expect(
            validateMessage({
                username: '  username  ',
                room: '  room  ',
                text: '  msg  ',
            })
        ).toMatchObject({
            username: 'username',
            room: 'room',
            text: 'msg',
        })
    })

    it('should truncate username', () => {
        expect(
            validateMessage({
                username: '1234567890-1234567890',
                room: 'room',
                text: 'msg',
            })
        ).toMatchObject({
            username: '1234567890',
        })
    })

    it('should throw error if no message ', () => {
        expect(() => validateMessage()).toThrow()
    })
})
