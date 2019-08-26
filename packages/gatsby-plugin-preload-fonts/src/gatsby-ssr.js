const React = require(`react`)

const { load: loadCache } = require(`./prepare/cache`)

function getLinkProps({ crossOrigin, pathname }) {
  switch (typeof crossOrigin) {
    case `string`:
      return { crossOrigin }
    case `boolean`:
      return crossOrigin ? { crossOrigin: `anonymous` } : {}
    case `function`:
      return getLinkProps({ crossOrigin: crossOrigin(pathname), pathname })
    default:
      return {}
  }
}

exports.onRenderBody = (
  { setHeadComponents, pathname = `/` },
  { crossOrigin = true }
) => {
  const cache = loadCache()
  if (!cache.assets[pathname]) return

  const props = getLinkProps({ crossOrigin, pathname })

  const assets = Object.keys(cache.assets[pathname])
  setHeadComponents(
    assets.map(href => (
      <link key={href} rel="preload" href={href} as="font" {...props} />
    ))
  )
}
