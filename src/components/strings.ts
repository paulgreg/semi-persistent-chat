export const insertAt = (str1 = '', pos = str1.length, str2 = '') =>
    str1.slice(0, pos) + str2 + str1.slice(pos)
