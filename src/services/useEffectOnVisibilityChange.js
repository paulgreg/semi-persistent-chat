import { useEffect } from 'react'
export default function useEffectOnVisibilityChange(cb, dep) {
    useEffect(() => {
        const checkFn = () => {
            if (isDocumentVisible()) {
                cb(dep)
            }
        }
        document.addEventListener('visibilitychange', checkFn)
        return () => document.removeEventListener('visibilitychange', checkFn)
    }, [cb, dep])
}

export const isDocumentVisible = () => document.visibilityState === 'visible'
