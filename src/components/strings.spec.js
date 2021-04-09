const { insertAt } = require('./strings')

describe('strings', () => {
    describe('insertAt', () => {
        test('should insert simple str', () =>
            expect(insertAt('a c', 2, 'b ')).toBe('a b c'))

        test('should insert emoji', () =>
            expect(insertAt('a c', 2, '😅 ')).toBe('a 😅 c'))

        test('should handle empty string', () =>
            expect(insertAt('', 0, '')).toBe(''))

        test('should handle undefined string', () =>
            expect(insertAt('', 0, undefined)).toBe(''))

        test('should handle off position', () =>
            expect(insertAt('', 10, '')).toBe(''))
    })
})
