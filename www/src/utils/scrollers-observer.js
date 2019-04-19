let observer
let scrollers = []

export const SCROLLER_CLASSNAME = `scrollerWithLead`

export const setupScrollersObserver = () => {
  if (typeof window.IntersectionObserver !== `undefined`) {
    const options = { rootMargin: `0px`, threshold: [1] }
    observer = new IntersectionObserver(handleIntersect, options)

    scrollers = Array.from(document.querySelectorAll(`.${SCROLLER_CLASSNAME}`))

    scrollers.forEach(scroller => observer.observe(scroller))
  }
}

export const unobserveScrollers = () => {
  if (typeof window.IntersectionObserver !== `undefined`) {
    scrollers.forEach(scroller => observer.unobserve(scroller))
  }
}

const handleIntersect = (entries, observer) => {
  entries.forEach(entry => {
    const target = entry.target

    if (entry.intersectionRatio > 0.5) {
      setTimeout(
        () => turnOnLeadScroll({ target, duration: 1000, distance: 20 }),
        250
      )
      observer.unobserve(target)
    }
  })
}

const turnOnLeadScroll = ({ target, duration, distance }) => {
  let startTime = null

  function animation(currentTime) {
    if (startTime === null) {
      startTime = currentTime
    }

    const timeElapsed = currentTime - startTime
    const getDistanceToScroll = ease(timeElapsed, 0, distance, duration)

    target.scroll({ top: 0, left: getDistanceToScroll })

    if (timeElapsed < duration) {
      requestAnimationFrame(animation)
    }
  }

  function ease(t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b
  }

  requestAnimationFrame(animation)
}
