export const onRouteUpdate = ({ location }, pluginOptions = {}) => {
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

  const delay = pluginOptions.pageTransitionDelay
  if (delay || !(`requestAnimationFrame` in window)) {
    // minimum delay to simulate a pair of requestAnimationFrame calls
    setTimeout(sendPageView, Math.min(32, delay))
  } else {
    requestAnimationFrame(() => {
      requestAnimationFrame(sendPageView)
    })
  }

  return null
}
