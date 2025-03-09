import { useCallback, useState } from 'react'

const useTimeout = (defaultDelay = 0) => {
    const [id, setId] = useState<NodeJS.Timeout | undefined>()

    const launch = useCallback(
        (fn: () => void, delay = defaultDelay) => {
            clearTimeout(id)
            setId(setTimeout(fn, delay))
        },
        [id, defaultDelay]
    )

    const stop = useCallback(() => {
        clearTimeout(id)
        setId(undefined)
    }, [id])

    return { launch, stop }
}

export default useTimeout
