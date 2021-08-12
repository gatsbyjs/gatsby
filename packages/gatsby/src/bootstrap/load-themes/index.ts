import { createRequireFromPath } from "gatsby-core-utils"
import path from "path"
import {
  IGatsbyConfigInput,
  mergeGatsbyConfig,
} from "../../utils/merge-gatsby-config"
import _Promise from "bluebird"
import _ from "lodash"
const debug = require(`debug`)(`gatsby:load-themes`)
import { preferDefault } from "../prefer-default"
import { getConfigFile } from "../get-config-file"
import { resolvePlugin } from "../load-plugins/load"
import reporter from "gatsby-cli/lib/reporter"
import { ITheme, IThemeSpec } from "./types"
import { IGatsbyConfig } from "../../redux/types"

// get the gatsby-config file for a theme
const resolveTheme = async (
  themeSpec: IThemeSpec | string,
  configFileThatDeclaredTheme: string,
  isMainConfig = false,
  rootDir: string
): Promise<ITheme> => {
  const themeName =
    typeof themeSpec === `string` ? themeSpec : themeSpec.resolve || ``
  let themeDir: string | undefined = undefined
  try {
    const scopedRequire = createRequireFromPath(`${rootDir}/:internal:`)
    // theme is an node-resolvable module
    themeDir = path.dirname(scopedRequire.resolve(themeName))
  } catch (e) {
    let pathToLocalTheme: string | undefined = undefined

    // only try to look for local theme in main site
    // local themes nested in other themes is potential source of problems:
    // because those are not hosted by npm, there is potential for multiple
    // local themes with same name that do different things and name being
    // main identifier that Gatsby uses right now, it's safer not to support it for now.
    if (isMainConfig) {
      pathToLocalTheme = path.join(rootDir, `plugins`, themeName)
      // is a local plugin OR it doesn't exist
      try {
        const { resolve } = resolvePlugin(themeName, rootDir)
        themeDir = resolve
      } catch (localErr) {
        reporter.panic(`Failed to resolve ${themeName}`, localErr)
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
  const theme = preferDefault(configModule)

  // if theme is a function, call it with the themeConfig
  let themeConfig: Record<string, string>
  if (_.isFunction(theme)) {
    themeConfig = theme(
      typeof themeSpec !== `string` && themeSpec.options
        ? themeSpec.options
        : {}
    )
  } else {
    themeConfig = theme
  }
  return {
    themeName,
    themeConfig,
    themeSpec:
      typeof themeSpec !== `string`
        ? themeSpec
        : {
            resolve: themeSpec,
          },
    themeDir,
    parentDir: rootDir,
    configFilePath,
  }
}

// single iteration of a recursive function that resolve parent themes
// It's recursive because we support child themes declaring parents and
// have to resolve all the way `up the tree` of parent/children relationships
//
// Theoretically, there could be an infinite loop here but in practice there is
// no use case for a loop so I expect that to only happen if someone is very
// off track and creating their own set of themes

type ValueOrArray<T> = T | Array<ValueOrArray<T>>

const processTheme = (
  { themeName, themeConfig, themeSpec, themeDir, configFilePath }: ITheme,
  { rootDir }
): Array<ITheme> | _Promise<ValueOrArray<ITheme>> => {
  const themesList = themeConfig && themeConfig.plugins
  // Gatsby themes don't have to specify a gatsby-config.js (they might only use gatsby-node, etc)
  // in this case they're technically plugins, but we should support it anyway
  // because we can't guarantee which files theme creators create first
  if (themeConfig && themesList) {
    // for every parent theme a theme defines, resolve the parent's
    // gatsby config and return it in order [parentA, parentB, child]
    return _Promise
      .mapSeries(themesList, async spec => {
        const themeObj = await resolveTheme(
          spec,
          configFilePath || ``,
          false,
          themeDir
        )
        return processTheme(themeObj, { rootDir: themeDir })
      })
      .then(arr =>
        arr.concat([
          { themeName, themeConfig, themeSpec, themeDir, parentDir: rootDir },
        ])
      )
  } else {
    // if a theme doesn't define additional themes, return the original theme
    return [{ themeName, themeConfig, themeSpec, themeDir, parentDir: rootDir }]
  }
}

export const loadThemes = async (
  config: IGatsbyConfig,
  {
    configFilePath,
    rootDir,
  }: {
    configFilePath: string
    rootDir: string
  }
): Promise<{
  config: IGatsbyConfigInput
  themes: Array<ITheme>
}> => {
  const themesA = await _Promise
    .mapSeries(config.plugins || [], async themeSpec => {
      const themeObj = await resolveTheme(
        typeof themeSpec === `string` ? themeSpec : themeSpec.resolve,
        configFilePath,
        true,
        rootDir
      )
      return processTheme(themeObj, { rootDir })
    })
    .then(arr => _.flattenDeep(arr))

  // log out flattened themes list to aid in debugging
  debug(themesA)

  // map over each theme, adding the theme itself to the plugins
  // list in the config for the theme. This enables the usage of
  // gatsby-node, etc in themes.
  return (
    _Promise
      .mapSeries(
        themesA,
        ({ themeName, themeConfig = {}, themeSpec, themeDir, parentDir }) => {
          return {
            ...themeConfig,
            plugins: [
              ...(themeConfig.plugins || []).map(plugin => {
                return {
                  resolve: typeof plugin === `string` ? plugin : plugin.resolve,
                  options: plugin.options || {},
                  parentDir: themeDir,
                }
              }),
              // theme plugin is last so it's gatsby-node, etc can override it's declared plugins, like a normal site.
              {
                resolve: themeName,
                options:
                  typeof themeSpec === `string` ? {} : themeSpec.options || {},
                parentDir,
              },
            ],
          }
        }
      )
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
