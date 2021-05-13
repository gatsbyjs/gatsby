const _ = require(`lodash`)
const fs = require(`fs`)
const React = require(`react`)

const { guess } = require(`guess-webpack/api`)

function urlJoin(...parts) {
  return parts.reduce((r, next) => {
    const segment = next == null ? `` : String(next).replace(/^\/+/, ``)
    return segment ? `${r.replace(/\/$/, ``)}/${segment}` : r
  }, ``)
}

let s
const readStats = () => {
  if (s) {
    return s
  } else {
    s = JSON.parse(
      fs.readFileSync(`${process.cwd()}/public/webpack.stats.json`, `utf-8`)
    )
    return s
  }
}

exports.onRenderBody = (
  { setHeadComponents, pathname, pathPrefix, loadPageDataSync },
  pluginOptions
) => {
  if (
    process.env.NODE_ENV === `production` ||
    process.env.NODE_ENV === `test`
  ) {
    const stats = readStats()
    const matchedPaths = Object.keys(
      guess({ path: pathname, threshold: pluginOptions.minimumThreshold })
    )
    if (!_.isEmpty(matchedPaths)) {
      const matchedPages = matchedPaths.map(loadPageDataSync)
      let componentUrls = []
      matchedPages.forEach(p => {
        if (p && p.componentChunkName) {
          const fetchKey = `assetsByChunkName[${p.componentChunkName}]`
          const chunks = _.get(stats, fetchKey)
          componentUrls = [...componentUrls, ...chunks]
        }
      })
      componentUrls = _.uniq(componentUrls)
      const components = componentUrls.map(c =>
        React.createElement(`Link`, {
          as: c.slice(-2) === `js` ? `script` : undefined,
          rel:
            c.slice(-2) === `js` ? `prefetch` : `prefetch alternate stylesheet`,
          key: c,
          href: urlJoin(pathPrefix, c),
        })
      )
      setHeadComponents(components)
    }

    return true
  }
  return false
}
