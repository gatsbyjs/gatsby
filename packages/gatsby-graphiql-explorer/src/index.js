const path = require(`path`)

module.exports = (expressApp, { graphqlEndpoint, getFragments }) => {
  const bundleUrlHandler = path.posix.join(graphqlEndpoint, `app.js`)
  const fragmentsUrlHandler = path.posix.join(graphqlEndpoint, `fragments`)

  expressApp.get(bundleUrlHandler, (req, res) => {
    res.set(`Cache-Control`, `public, max-age=31557600`)
    res.sendFile(path.join(__dirname, `app.js`))
  })

  expressApp.get(graphqlEndpoint, (req, res) => {
    res.sendFile(path.join(__dirname, `index.html`))
  })

  expressApp.get(fragmentsUrlHandler, (req, res) => {
    // getFragments might not be passed if older gatsby core version is used
    // so checking before calling it
    res.json(getFragments ? getFragments() : [])
  })
}
