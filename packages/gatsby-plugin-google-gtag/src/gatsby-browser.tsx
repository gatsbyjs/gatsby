import type { GatsbyBrowser } from "gatsby"

export { wrapPageElement } from "./gatsby-shared"

export const onRouteUpdate: GatsbyBrowser[`onRouteUpdate`] = ({ location }) => {
  // @ts-ignore gtag is global
  if (process.env.NODE_ENV !== `production` || typeof gtag !== `function`) {
    return null
  }

  const pathIsExcluded =
    location &&
    // @ts-ignore globals
    typeof window.excludeGtagPaths !== `undefined` &&
    // @ts-ignore globals
    window.excludeGtagPaths.some(rx => rx.test(location.pathname))

  if (pathIsExcluded) {
    return null
  }

  // wrap inside a timeout to make sure react-helmet is done with its changes (https://github.com/gatsbyjs/gatsby/issues/11592)
  const sendPageView = (): void => {
    const pagePath = location
      ? location.pathname + location.search + location.hash
      : undefined
    // @ts-ignore globals
    window.gtag(`event`, `page_view`, { page_path: pagePath })
  }

  if (`requestAnimationFrame` in window) {
    requestAnimationFrame(() => {
      requestAnimationFrame(sendPageView)
    })
  } else {
    // simulate 2 rAF calls
    setTimeout(sendPageView, 32)
  }

  return null
}
