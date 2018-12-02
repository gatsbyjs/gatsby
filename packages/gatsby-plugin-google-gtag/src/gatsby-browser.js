exports.onRouteUpdate = ({ location }) => {
  if (process.env.NODE_ENV !== `production` || typeof gtag !== `function`) {
    return null
  }

  const pathIsExcluded =
    location &&
    typeof window.excludeGtagPaths !== `undefined` &&
    window.excludeGtagPaths.some(rx => rx.test(location.pathname))

  if (pathIsExcluded) return null

  const pagePath = location
    ? location.pathname + location.search + location.hash
    : undefined
  window.gtag(`event`, `page_view`, { page_path: pagePath })

  return null
}
