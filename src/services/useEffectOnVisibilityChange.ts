import { useEffect } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useEffectOnVisibilityChange = (cb: (dep: any) => void, dep: any) => {
    useEffect(() => {
        const checkFn = () => isDocumentVisible() && cb(dep)

        document.addEventListener('visibilitychange', checkFn)
        return () => document.removeEventListener('visibilitychange', checkFn)
    }, [cb, dep])
}

export const isDocumentVisible = () => document.visibilityState === 'visible'

export default useEffectOnVisibilityChange
