import { ScrollContext } from "./scroll-handler"
import { useRef, useContext, useLayoutEffect } from "react"
import { useLocation } from "@reach/router"

interface IScrollRestorationProps<T extends HTMLElement> {
  ref: React.MutableRefObject<T | null>
  onScroll(): void
}

export function useScrollRestoration<T extends HTMLElement>(
  identifier: string
): IScrollRestorationProps<T> {
  const location = useLocation()
  const state = useContext(ScrollContext)
  const ref = useRef<T>(null)

  useLayoutEffect((): void => {
    if (ref.current) {
      const position = state.read(location, identifier)
      ref.current.scrollTo(0, position || 0)
    }
  }, [location.key])

  return {
    ref,
    onScroll(): void {
      if (ref.current) {
        state.save(location, identifier, ref.current.scrollTop)
      }
    },
  }
}
