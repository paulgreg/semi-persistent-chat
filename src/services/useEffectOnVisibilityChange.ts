import { useEffect } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useEffectOnVisible = (cb: (dep: any) => void, dep: any) => {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useEffectOnceOnVisibleAndFocus = (cb: () => void, dep: any) => {
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
