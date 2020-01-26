const path = require(`path`)
const mergeGatsbyConfig = require(`../../utils/merge-gatsby-config`)
const Promise = require(`bluebird`)
const _ = require(`lodash`)
const debug = require(`debug`)(`gatsby:load-themes`)
const preferDefault = require(`../prefer-default`)
const getConfigFile = require(`../get-config-file`)
const { resolvePlugin } = require(`../load-plugins/load`)
const reporter = require(`gatsby-cli/lib/reporter`)

// get the gatsby-config file for a theme
const resolveTheme = async (
  themeSpec,
  configFileThatDeclaredTheme,
  isMainConfig = false,
  rootDir
) => {
  const themeName = themeSpec.resolve || themeSpec
  let themeDir
  try {
    // theme is an node-resolvable module
    themeDir = path.dirname(require.resolve(themeName))
  } catch (e) {
    let pathToLocalTheme

    // only try to look for local theme in main site
    // local themes nested in other themes is potential source of problems:
    // because those are not hosted by npm, there is potential for multiple
    // local themes with same name that do different things and name being
    // main identifier that Gatsby uses right now, it's safer not to support it for now.
    if (isMainConfig) {
      pathToLocalTheme = path.join(path.resolve(`.`), `plugins`, themeName)
      // is a local plugin OR it doesn't exist
      try {
        const { resolve } = resolvePlugin(themeName, rootDir)
        themeDir = resolve
      } catch (localErr) {
        // catch shouldn't be empty :shrug:
      }
    }

    if (!themeDir) {
      const nodeResolutionPaths = module.paths.map(p => path.join(p, themeName))
      reporter.panic({
        id: `10226`,
        context: {
          themeName,
          configFilePath: configFileThatDeclaredTheme,
          pathToLocalTheme,
          nodeResolutionPaths,
        },
      })
    }
  }

  const { configModule, configFilePath } = await getConfigFile(
    themeDir,
    `gatsby-config`
  )
  let theme = preferDefault(configModule)

  // if theme is a function, call it with the themeConfig
  let themeConfig = theme
  if (_.isFunction(theme)) {
    themeConfig = theme(themeSpec.options || {})
  }
  return { themeName, themeConfig, themeSpec, themeDir, configFilePath }
}

// single iteration of a recursive function that resolve parent themes
// It's recursive because we support child themes declaring parents and
// have to resolve all the way `up the tree` of parent/children relationships
//
// Theoretically, there could be an infinite loop here but in practice there is
// no use case for a loop so I expect that to only happen if someone is very
// off track and creating their own set of themes
const processTheme = (
  { themeName, themeConfig, themeSpec, themeDir, configFilePath },
  { useLegacyThemes, rootDir }
) => {
  const themesList = useLegacyThemes
    ? themeConfig && themeConfig.__experimentalThemes
    : themeConfig && themeConfig.plugins
  // Gatsby themes don't have to specify a gatsby-config.js (they might only use gatsby-node, etc)
  // in this case they're technically plugins, but we should support it anyway
  // because we can't guarantee which files theme creators create first
  if (themeConfig && themesList) {
    // for every parent theme a theme defines, resolve the parent's
    // gatsby config and return it in order [parentA, parentB, child]
    return Promise.mapSeries(themesList, async spec => {
      const themeObj = await resolveTheme(spec, configFilePath, false, rootDir)
      return processTheme(themeObj, { useLegacyThemes, rootDir })
    }).then(arr =>
      arr.concat([{ themeName, themeConfig, themeSpec, themeDir }])
    )
  } else {
    // if a theme doesn't define additional themes, return the original theme
    return [{ themeName, themeConfig, themeSpec, themeDir }]
  }
}

module.exports = async (
  config,
  { useLegacyThemes = false, configFilePath, rootDir }
) => {
  const themesA = await Promise.mapSeries(
    useLegacyThemes ? config.__experimentalThemes || [] : config.plugins || [],
    async themeSpec => {
      const themeObj = await resolveTheme(
        themeSpec,
        configFilePath,
        true,
        rootDir
      )
      return processTheme(themeObj, { useLegacyThemes, rootDir })
    }
  ).then(arr => _.flattenDeep(arr))

  // log out flattened themes list to aid in debugging
  debug(themesA)

  // map over each theme, adding the theme itself to the plugins
  // list in the config for the theme. This enables the usage of
  // gatsby-node, etc in themes.
  return (
    Promise.mapSeries(themesA, ({ themeName, themeConfig = {}, themeSpec }) => {
      return {
        ...themeConfig,
        plugins: [
          ...(themeConfig.plugins || []),
          // theme plugin is last so it's gatsby-node, etc can override it's declared plugins, like a normal site.
          { resolve: themeName, options: themeSpec.options || {} },
        ],
      }
    })
      /**
       * themes resolve to a gatsby-config, so here we merge all of the configs
       * into a single config, making sure to maintain the order in which
       * they were defined so that later configs, like the user's site and
       * children, can override functionality in earlier themes.
       */
      .reduce(mergeGatsbyConfig, {})
      .then(newConfig => {
        return {
          config: mergeGatsbyConfig(newConfig, config),
          themes: themesA,
        }
      })
  )
}
