import { useEffect } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useEffectOnVisible = (cb: (dep: any) => void, dep: any) => {
    useEffect(() => {
        const callIfVisible = () => {
            if (isDocumentVisible()) cb(dep)
        }

        document.addEventListener('visibilitychange', callIfVisible)
        return () =>
            document.removeEventListener('visibilitychange', callIfVisible)
    }, [cb, dep])
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useEffectOnceOnVisible = (cb: () => void, dep: any) => {
    useEffect(() => {
        if (document.visibilityState === 'visible' && document.hasFocus()) {
            cb()
            return
        }

        const handler = () => {
            if (document.visibilityState === 'visible' && document.hasFocus()) {
                cb()
                cleanup()
            }
        }

        const cleanup = () => {
            document.removeEventListener('visibilitychange', handler)
            window.removeEventListener('focus', handler)
        }

        document.addEventListener('visibilitychange', handler)
        window.addEventListener('focus', handler)

        return cleanup
    }, [cb, dep])
}

export const isDocumentVisible = () => document.visibilityState === 'visible'
