const React = require(`react`)

const { load: loadCache } = require(`./prepare/cache`)

exports.onRenderBody = (
  { setHeadComponents, pathname = `/` },
  pluginOptions
) => {
  const cache = loadCache()
  if (!cache.assets[pathname]) return

  const assets = Object.keys(cache.assets[pathname])
  setHeadComponents(
    assets.map(href => <link key={href} rel="preload" href={href} as="font" />)
  )
}
