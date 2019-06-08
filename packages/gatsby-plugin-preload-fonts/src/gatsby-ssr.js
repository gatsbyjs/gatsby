const React = require(`react`)
const Promise = require(`bluebird`)

const { load: loadCache } = require(`./prepare/cache`)

const cachePromise = new Promise(resolve =>
  loadCache().then(({ assets }) => resolve(assets))
)

exports.onRenderBody = ({ setHeadComponents, pathname = `/` }, pluginOptions) =>
  cachePromise.then(routes => {
    if (!routes[pathname]) return

    const assets = Object.keys(routes[pathname])
    setHeadComponents(
      assets.map(href => (
        <link key={href} rel="preload" href={href} as="font" />
      ))
    )
  })
