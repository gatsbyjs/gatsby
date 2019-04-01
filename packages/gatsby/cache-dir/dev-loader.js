// Initialized by calling loadPages
let pagesManifest = null

const fetchPages = () =>
  new Promise((resolve, reject) => {
    const req = new XMLHttpRequest()
    req.open(`GET`, `/___pages`, true)
    req.onreadystatechange = () => {
      if (req.readyState == 4) {
        if (req.status === 200) {
          // TODO is this safe? Maybe just do this check in dev mode?
          const contentType = req.getResponseHeader(`content-type`)
          if (!contentType || !contentType.startsWith(`application/json`)) {
            reject()
          } else {
            resolve(JSON.parse(req.responseText))
          }
        } else {
          reject()
        }
      }
    }
    req.send(null)
  })

// Returns a promise that fetches the `/___pages` resource from the
// running `gatsby develop` server. It contains a map of all pages on
// the site (path -> page). Call `getPagesManifest()` to retrieve the
// pages. Used by dev-404-page to present a list of all pages
const loadPages = () =>
  fetchPages().then(pages => {
    pagesManifest = pages
  })

// Returns the map of all pages on the site (path -> page)
const getPagesManifest = () => {
  if (pagesManifest === null) {
    throw new Error(
      `pages-manifest hasn't been initialized. Ensure the dev-loader/loadPages has been called first`
    )
  } else {
    return pagesManifest
  }
}

module.exports = {
  loadPages,
  getPagesManifest,
}
