export const onRouteUpdate = ({ location }) => {
  if (process.env.NODE_ENV !== `production` || typeof ga !== `function`) {
    return null
  }

  const pathIsExcluded =
    location &&
    typeof window.excludeGAPaths !== `undefined` &&
    window.excludeGAPaths.some(rx => rx.test(location.pathname))

  if (pathIsExcluded) return null

  // wrap inside a timeout to make sure react-helmet is done with it's changes (https://github.com/gatsbyjs/gatsby/issues/9139)
  // reactHelmet is using requestAnimationFrame so we should use it too: https://github.com/nfl/react-helmet/blob/5.2.0/src/HelmetUtils.js#L296-L299
  const sendPageView = () => {
    const pagePath = location
      ? location.pathname + location.search + location.hash
      : undefined
    window.ga(`set`, `page`, pagePath)
    window.ga(`send`, `pageview`)
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
