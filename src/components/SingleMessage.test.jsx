import { getHighlightedMessage } from './SingleMessage'

describe('Message', () => {
    describe('getHighlightedMessage', () => {
        test('should highlight Bob in message', () =>
            expect(
                getHighlightedMessage({ login: 'Bob', text: 'Hey Bob' })
            ).toEqual({ text: 'Hey Bob', shouldHighlight: true }))
        test('should highlight Bob in lowercase', () =>
            expect(
                getHighlightedMessage({ login: 'Bob', text: 'Hey bob' })
            ).toEqual({ text: 'Hey bob', shouldHighlight: true }))
        test('should NOT highlight Bob if part of a word', () =>
            expect(
                getHighlightedMessage({ login: 'Bob', text: 'HeyBobInAWord' })
            ).toEqual({ text: 'HeyBobInAWord', shouldHighlight: false }))
    })
})
