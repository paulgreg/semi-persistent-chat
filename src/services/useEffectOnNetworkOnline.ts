import { useEffect } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useEffectOnNetworkOnline = (cb: (dep: any) => void, dep: any) => {
    useEffect(() => {
        const checkFn = () => navigator.onLine && cb(dep)

        globalThis.addEventListener('online', checkFn)
        return () => globalThis.removeEventListener('online', checkFn)
    }, [cb, dep])
}

export default useEffectOnNetworkOnline
