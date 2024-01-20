import { validateMessage, checkMessageValidity } from './validation'

describe('checkMessageValidity', () => {
    it(`should return true if message if well formated`, () => {
        expect(
            checkMessageValidity({
                user: 'user',
                room: 'room',
                message: 'msg',
            })
        ).toBe(true)
    })
    ;[
        {
            message: undefined,
            title: 'message undefined',
        },
        {
            message: {},
            title: 'message empty',
        },
        {
            message: {
                room: 'room',
                message: 'msg',
            },
            title: 'message has no user',
        },
        {
            message: {
                user: 'user',
                message: 'msg',
            },
            title: 'message has no room',
        },
        {
            message: {
                user: 'user',
                room: 'room',
            },
            title: 'message has no message',
        },
        {
            message: {
                user: ' ',
                room: 'room',
                message: 'msg',
            },
            title: 'message has empty user',
        },
    ].forEach(({ message, title }) =>
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
