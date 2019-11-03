import { useEffect } from "react"
export default function useEffectOnVisibilityChange(cb, dep) {
  useEffect(() => {
    const checkFn = () => {
      if (document.visibilityState === "visible") {
        cb(dep)
      }
    }
    document.addEventListener("visibilitychange", checkFn)
    return () => document.removeEventListener("visibilitychange", checkFn)
  }, [cb, dep])
}
