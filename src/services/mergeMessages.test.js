import mergeMessages from './mergeMessages'

describe('mergeMessages', () => {
    it('should return empty messages', () => {
        expect(mergeMessages([], [])).toEqual([])
    })

    it('should return old messages', () => {
        expect(
            mergeMessages([{ uuid: '1', message: 'a', validated: false }], [])
        ).toEqual([{ uuid: '1', message: 'a', validated: false }])
    })

    it('should return new messages', () => {
        expect(
            mergeMessages([], [{ uuid: '1', message: 'b', validated: true }])
        ).toEqual([{ uuid: '1', message: 'b', validated: true }])
    })

    it('should merge old & new messages', () => {
        expect(
            mergeMessages(
                [{ uuid: '1', message: 'a', validated: true }],
                [{ uuid: '2', message: 'b', validated: false }]
            )
        ).toEqual([
            { uuid: '1', message: 'a', validated: true },
            { uuid: '2', message: 'b', validated: false },
        ])
    })

    it('should merge messages', () => {
        expect(
            mergeMessages(
                [
                    {
                        uuid: 'u1',
                        message: 'a',
                        validated: true,
                    },
                    {
                        uuid: 'u2',
                        message: 'b',
                        validated: true,
                    },
                ],
                [
                    {
                        uuid: 'u1',
                        message: 'c',
                        validated: false,
                    },
                ]
            )
        ).toEqual([
            {
                uuid: 'u1',
                message: 'c',
                validated: false,
            },
            {
                uuid: 'u2',
                message: 'b',
                validated: true,
            },
        ])
    })

    it('should merge remove dupplicates and keep validate flag', () => {
        expect(
            mergeMessages(
                [{ uuid: 1, message: 'c', validated: false }],
                [{ uuid: 1, message: 'c', validated: true }]
            )
        ).toEqual([{ uuid: 1, message: 'c', validated: true }])
    })
})
