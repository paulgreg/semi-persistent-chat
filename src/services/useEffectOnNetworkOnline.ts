import { useEffect } from 'react'

const useEffectOnNetworkOnline = <T>(cb: (dep: T) => void, dep: T) => {
    useEffect(() => {
        const checkFn = () => navigator.onLine && cb(dep)

        globalThis.addEventListener('online', checkFn)
        return () => globalThis.removeEventListener('online', checkFn)
    }, [cb, dep])
}

export default useEffectOnNetworkOnline
