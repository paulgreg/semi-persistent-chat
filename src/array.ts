export const arrayEquals = <T>(array1: Array<T>, array2: Array<T>) => {
    if (!array1 || !array2) return false
    if (array1.length !== array2.length) return false

    for (let i = 0, l = array1.length; i < l; i++) {
        if (array1[i] !== array2[i]) return false
    }

    return true
}
