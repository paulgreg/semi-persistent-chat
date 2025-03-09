import mergeMessages from './mergeMessages'

describe('mergeMessages', () => {
    it('should return empty messages', () => {
        expect(mergeMessages([], [])).toEqual([])
    })

    it('should return old messages', () => {
        expect(
            mergeMessages([{ msgId: '1', text: 'a', validated: false }], [])
        ).toEqual([{ msgId: '1', text: 'a', validated: false }])
    })

    it('should return new messages', () => {
        expect(
            mergeMessages([], [{ msgId: '1', text: 'b', validated: true }])
        ).toEqual([{ msgId: '1', text: 'b', validated: true }])
    })

    it('should merge old & new messages', () => {
        expect(
            mergeMessages(
                [{ msgId: '1', text: 'a', validated: true }],
                [{ msgId: '2', text: 'b', validated: false }]
            )
        ).toEqual([
            { msgId: '1', text: 'a', validated: true },
            { msgId: '2', text: 'b', validated: false },
        ])
    })

    it('should merge messages', () => {
        expect(
            mergeMessages(
                [
                    {
                        msgId: 'u1',
                        text: 'a',
                        validated: true,
                    },
                    {
                        msgId: 'u2',
                        text: 'b',
                        validated: true,
                    },
                ],
                [
                    {
                        msgId: 'u1',
                        text: 'c',
                        validated: false,
                    },
                ]
            )
        ).toEqual([
            {
                msgId: 'u1',
                text: 'c',
                validated: false,
            },
            {
                msgId: 'u2',
                text: 'b',
                validated: true,
            },
        ])
    })

    it('should merge remove dupplicates and keep validate flag', () => {
        expect(
            mergeMessages(
                [{ msgId: 1, text: 'c', validated: false }],
                [{ msgId: 1, text: 'c', validated: true }]
            )
        ).toEqual([{ msgId: 1, text: 'c', validated: true }])
    })
})
