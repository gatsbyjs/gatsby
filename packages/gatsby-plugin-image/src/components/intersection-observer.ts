import { RefObject } from "react"

let intersectionObserver: IntersectionObserver

type Unobserver = () => void

export function createIntersectionObserver(
  callback: () => void
): (element: RefObject<HTMLElement | undefined>) => Unobserver {
  // if we don't support intersectionObserver we don't lazy load (Sorry IE 11).
  if (!(`IntersectionObserver` in window)) {
    return function observe(): Unobserver {
      callback()
      return function unobserve(): void {}
    }
  }

  if (!intersectionObserver) {
    intersectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            callback()
          }
        })
      },
      {
        // TODO look at lighthouse & amp-image on what values they are using
        rootMargin: `150%`,
      }
    )
  }

  return function observe(
    element: RefObject<HTMLElement | undefined>
  ): Unobserver {
    if (element.current) {
      intersectionObserver.observe(element.current)
    }

    return function unobserve(): void {
      if (intersectionObserver && element.current) {
        intersectionObserver.unobserve(element.current)
      }
    }
  }
}
