const support = function(feature) {
  if (typeof document === `undefined`) {
    return false
  }
  const fakeLink = document.createElement(`link`)
  try {
    if (fakeLink.relList && typeof fakeLink.relList.supports === `function`) {
      return fakeLink.relList.supports(feature)
    }
  } catch (err) {
    return false
  }
}
const linkPrefetchStrategy = function(url) {
  if (typeof document === "undefined") {
    return
  }
  const link = document.createElement("link")
  link.setAttribute("rel", "prefetch")
  link.setAttribute("href", url)
  const parentElement =
    document.getElementsByTagName("head")[0] ||
    document.getElementsByName("script")[0].parentNode
  parentElement.appendChild(link)
}
const importPrefetchStrategy = function(url) {
  return new Promise(function(resolve_1, reject_1) {
    require([url], resolve_1, reject_1)
  })
}
const supportedPrefetchStrategy = support("prefetch")
  ? linkPrefetchStrategy
  : importPrefetchStrategy

const preFetched = {}

export function withPrefix(path) {
  return normalizePath(`${__PATH_PREFIX__}/${path}`)
}

function normalizePath(path) {
  return path.replace(/\/+/g, `/`)
}

const prefetch = function(url) {
  url = withPrefix(url)

  if (preFetched[url]) {
    return
  }
  preFetched[url] = true
  supportedPrefetchStrategy(url)
}

export default prefetch
