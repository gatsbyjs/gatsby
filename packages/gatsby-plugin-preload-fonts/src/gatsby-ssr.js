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
  if (!cache.assets[pathname]) return

  const props = getLinkProps({ crossOrigin, pathname })

  const assets = Object.keys(cache.assets[pathname])

  setHeadComponents(
    assets.map(href => {
      let assetProps

      try {
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
