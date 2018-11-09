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
  return false
}
const linkPrefetchStrategy = function(url) {
  if (typeof document === `undefined`) {
    return
  }
  const link = document.createElement(`link`)
  link.setAttribute(`rel`, `prefetch`)
  link.setAttribute(`href`, url)
  const parentElement =
    document.getElementsByTagName(`head`)[0] ||
    document.getElementsByName(`script`)[0].parentNode
  parentElement.appendChild(link)
}
const xhrPrefetchStrategy = function(url) {
  const req = new XMLHttpRequest()
  req.open(`GET`, url, true)
  req.withCredentials = true
  req.send(null)
}

const supportedPrefetchStrategy = support(`prefetch`)
  ? linkPrefetchStrategy
  : xhrPrefetchStrategy

const preFetched = {}

const prefetch = function(url) {
  if (preFetched[url]) {
    return
  }
  preFetched[url] = true
  supportedPrefetchStrategy(url)
}

export default prefetch
