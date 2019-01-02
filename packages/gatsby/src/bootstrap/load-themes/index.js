const path = require("path")
const mergeGatsbyConfig = require(`../../utils/merge-gatsby-config`)
const Promise = require(`bluebird`)
const _ = require("lodash")
const debug = require("debug")("gatsby:load-themes")
const preferDefault = require(`../prefer-default`)
const getConfigFile = require(`../get-config-file`)

const resolveTheme = async themeSpec => {
  const themeName = themeSpec.resolve || themeSpec
  const themeConfig = themeSpec.options || {}
  const themeDir = path.dirname(require.resolve(themeName))
  const theme = await preferDefault(getConfigFile(themeDir, `gatsby-config`))
  // if theme is a function, call it with the themeConfig
  let themeConfigObj = theme
  if (_.isFunction(theme)) {
    themeConfigObj = theme(themeSpec.options || {})
  }
  return { themeName, themeConfigObj, themeSpec }
}

// single iteration of a recursive function that resolve parent themes
const processTheme = ({ themeName, themeConfigObj, themeSpec }) => {
  // gatsby themes don't have to specify a gatsby-config.js (they might only use gatsby-node, etc)
  if (themeConfigObj && themeConfigObj.__experimentalThemes) {
    return Promise.mapSeries(
      themeConfigObj.__experimentalThemes,
      async spec => {
        const themeObj = await resolveTheme(spec)
        return processTheme(themeObj)
      }
    ).then(arr => {
      console.log(arr)
      return arr.concat([{ themeName, themeConfigObj, themeSpec }])
    })
  } else {
    return [{ themeName, themeConfigObj, themeSpec }]
  }
}

module.exports = async config => {
  let themes = []
  return await Promise.mapSeries(
    config.__experimentalThemes,
    async themeSpec => {
      const themeObj = await resolveTheme(themeSpec)
      return processTheme(themeObj)
    }
  )
    .then(arr => {
      const flatThemes = _.flattenDeep(arr)
      debug(flatThemes)
      themes = flatThemes
      return flatThemes
    })
    .mapSeries(({ themeName, themeConfigObj = {}, themeSpec }) => {
      return {
        ...themeConfigObj,
        plugins: [
          ...(themeConfigObj.plugins || []),
          // theme plugin is last so it's gatsby-node, etc can override it's declared plugins, like a normal site.
          { resolve: themeName, options: themeSpec.options || {} },
        ],
      }
    })
    .reduce(mergeGatsbyConfig, {})
    .then(newConfig => ({
      config: mergeGatsbyConfig(newConfig, config),
      themes,
    }))
}
