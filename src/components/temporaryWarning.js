import { useCallback, useState } from 'react'
import useTimeout from './useTimeout'

export const useTemporaryWarning = () => {
    const [launch] = useTimeout()
    const [warning, setWarning] = useState('')

    const setTemporaryWarning = useCallback(
        (text) => {
            setWarning(text)
            launch(() => setWarning(''), 4 * 1000)
        },
        [setWarning, launch]
    )

    return [warning, setWarning, setTemporaryWarning]
}
