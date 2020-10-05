import { RefObject } from "react"

let intersectionObserver: IntersectionObserver

export function createIntersectionObserver(callback: Function): any {
  // if we don't support intersectionObserver we don't lazy load (Sorry IE 11).
  if (!(`IntersectionObserver` in window)) {
    return function observe() {
      callback()
      return function unobserve() {}
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
        // TODO tweak
        rootMargin: `150%`,
      }
    )
  }

  return function observe(element: RefObject<HTMLElement>) {
    intersectionObserver.observe(element.current)

    return function unobserve() {
      if (intersectionObserver && element.current) {
        intersectionObserver.unobserve(element.current)
      }
    }
  }
}
