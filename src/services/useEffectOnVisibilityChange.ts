import { useEffect } from 'react'

export const useEffectOnVisible = <T>(cb: (dep: T) => void, dep: T) => {
    useEffect(() => {
        const handler = () => {
            if (isDocumentVisible()) cb(dep)
        }

        document.addEventListener('visibilitychange', handler)

        return () => {
            document.removeEventListener('visibilitychange', handler)
        }
    }, [cb, dep])
}

export const useEffectOnceOnVisibleAndFocus = (
    cb: () => void,
    dep: unknown
) => {
    useEffect(() => {
        if (isDocumentVisible()) {
            cb()
            return
        }

        const handler = () => {
            if (isDocumentVisible()) {
                cb()
                cleanup()
            }
        }

        const cleanup = () => {
            document.removeEventListener('visibilitychange', handler)
            globalThis.removeEventListener('focus', handler)
        }

        document.addEventListener('visibilitychange', handler)
        globalThis.addEventListener('focus', handler)

        return cleanup
    }, [cb, dep])
}

export const isDocumentVisible = () =>
    document.visibilityState === 'visible' && document.hasFocus()
