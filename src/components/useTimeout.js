import { useCallback, useMemo, useState } from 'react'

const useTimeout = (defaultDelay = 0) => {
    const [id, setId] = useState()

    const launch = useCallback(
        (fn, delay = defaultDelay) => {
            clearTimeout(id)
            setId(setTimeout(fn, delay))
        },
        [id, defaultDelay]
    )

    const stop = useCallback(() => {
        clearTimeout(id)
        setId(null)
    }, [id])

    const pending = useMemo(() => !!id, [id])

    return [launch, stop, pending]
}
export default useTimeout
