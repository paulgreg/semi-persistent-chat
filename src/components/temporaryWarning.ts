import { useCallback, useState } from 'react'
import useTimeout from './useTimeout'

export const useTemporaryWarning = () => {
    const { launch } = useTimeout()
    const [warning, setWarning] = useState<string>('')

    const cleanWarning = useCallback(() => {
        setWarning('')
    }, [])

    const setTemporaryWarning = useCallback(
        (text: string) => {
            setWarning(text)
            launch(cleanWarning, 4 * 1000)
        },
        [launch, cleanWarning]
    )

    return { warning, setWarning, setTemporaryWarning }
}
