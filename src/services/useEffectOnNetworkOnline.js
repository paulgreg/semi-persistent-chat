import { useEffect } from 'react'

export default function useEffectOnNetworkOnline(cb, dep) {
    useEffect(() => {
        const checkFn = () => navigator.onLine && cb(dep)

        window.addEventListener('online', checkFn)
        return () => window.removeEventListener('online', checkFn)
    }, [cb, dep])
}
