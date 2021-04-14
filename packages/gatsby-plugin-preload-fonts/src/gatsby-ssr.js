const React = require(`react`)
const { URL } = require(`url`)

const { load: loadCache } = require(`./prepare/cache`)

function getLinkProps({ crossOrigin, pathname }) {
  switch (typeof crossOrigin) {
    case `string`:
      return { crossOrigin }
    case `function`:
      return getLinkProps({ crossOrigin: crossOrigin(pathname), pathname })
    default:
      return { crossOrigin: `anonymous` }
  }
}

exports.onRenderBody = (
  { setHeadComponents, pathname = `/` },
  { crossOrigin = `anonymous` } = {}
) => {
  const cache = loadCache()
  // try to load assets from cache. Consider route with and without trailing slash as lookup key
  const cacheEntry = cache.assets[pathname] || cache.assets[pathname + `/`]
  if (!cacheEntry) return

  const props = getLinkProps({ crossOrigin, pathname })

  const assets = Object.keys(cacheEntry)

  setHeadComponents(
    assets.map(href => {
      let assetProps

      // External urls should get the props from the plugin configuration.
      // Local urls will be forced with `crossOrigin: "anonymous"`
      try {
        // check if URL is external, if not this constructor throws.
        new URL(href)
        assetProps = props
      } catch (e) {
        assetProps = { crossOrigin: `anonymous` }
      }

      return (
        <link key={href} as="font" href={href} rel="preload" {...assetProps} />
      )
    })
  )
}
