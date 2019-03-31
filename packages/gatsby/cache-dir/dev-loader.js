let pagesManifest = {}

const fetchPages = () =>
  new Promise((resolve, reject) => {
    console.log(`fetch pages`)
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

const loadPages = () =>
  fetchPages().then(pages => {
    pagesManifest = pages
  })

const getPagesManifest = () => pagesManifest

module.exports = {
  loadPages,
  getPagesManifest,
}
