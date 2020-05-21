import { ScrollContext } from "./scroll-handler"
import { useRef, useContext, useLayoutEffect } from "react"
import { useLocation } from "@reach/router"

export function useScrollRestoration(identifier: string) {
  const location = useLocation()
  const state = useContext(ScrollContext)
  const ref = useRef<HTMLElement>()

  useLayoutEffect(() => {
    const position = state.read(location, identifier)
    ref.current!.scrollTo(0, position)
  }, [])

  return {
    ref,
    onScroll() {
      state.save(location, identifier, ref.current!.scrollTop)
    },
  }
}
