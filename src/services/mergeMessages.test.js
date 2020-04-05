import mergeMessages from "./mergeMessages"

describe('mergeMessages', () => {

    it ('should return empty messages', () => {
        expect(mergeMessages([], [])).toEqual([])
    })

    it ('should return old messages', () => {
        expect(mergeMessages([{old: true}], [])).toEqual([{old: true}])
    })
    
    it ('should return new messages', () => {
        expect(mergeMessages([], [{new: true}])).toEqual([{new: true}])
    })

    it ('should merge old & new messages', () => {
        expect(mergeMessages([{old: true}], [{new: true}])).toEqual([{old: true}, {new: true}])
    })

    it ('should merge remove dupplicates and keep validate flag', () => {
        expect(mergeMessages([{uuid: 1}], [{uuid: 1, validated: true}])).toEqual([{uuid: 1, validated: true}])
    })
})