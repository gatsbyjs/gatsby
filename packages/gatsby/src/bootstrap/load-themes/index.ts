import { createRequireFromPath } from "gatsby-core-utils"
import * as path from "path"
import {
  IGatsbyConfigInput,
  mergeGatsbyConfig,
  PluginEntry,
  IPluginEntryWithParentDir,
} from "../../utils/merge-gatsby-config"
import { mapSeries } from "bluebird"
import { flattenDeep, isEqual, isFunction, uniqWith } from "lodash"
import DebugCtor from "debug"
import { preferDefault } from "../prefer-default"
import { getConfigFile } from "../get-config-file"
import { resolvePlugin } from "../load-plugins/resolve-plugin"
import reporter from "gatsby-cli/lib/reporter"

const debug = DebugCtor(`gatsby:load-themes`)

interface IThemeObj {
  themeName: string
  themeConfig: IGatsbyConfigInput
  themeDir: string
  themeSpec: PluginEntry
  parentDir: string
  configFilePath?: string
}

// get the gatsby-config file for a theme
const resolveTheme = async (
  themeSpec: PluginEntry,
  configFileThatDeclaredTheme: string | undefined,
  isMainConfig: boolean = false,
  rootDir: string
): Promise<IThemeObj> => {
  const themeName =
    typeof themeSpec === `string` ? themeSpec : themeSpec.resolve
  let themeDir
  try {
    const scopedRequire = createRequireFromPath(`${rootDir}/:internal:`)
    // theme is an node-resolvable module
    themeDir = path.dirname(scopedRequire.resolve(themeName))
  } catch (e) {
    let pathToLocalTheme

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
  const theme:
    | IGatsbyConfigInput
    | ((options?: Record<string, unknown>) => IGatsbyConfigInput) =
    preferDefault(configModule)

  // if theme is a function, call it with the themeConfig
  const themeConfig = isFunction(theme)
    ? theme(typeof themeSpec === `string` ? {} : themeSpec.options)
    : theme

  return {
    themeName,
    themeConfig,
    themeSpec,
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
const processTheme = (
  { themeName, themeConfig, themeSpec, themeDir, configFilePath }: IThemeObj,
  { rootDir }: { rootDir: string }
): Promise<Array<IThemeObj>> => {
  const themesList = themeConfig && themeConfig.plugins
  // Gatsby themes don't have to specify a gatsby-config.js (they might only use gatsby-node, etc)
  // in this case they're technically plugins, but we should support it anyway
  // because we can't guarantee which files theme creators create first
  if (themeConfig && themesList) {
    // for every parent theme a theme defines, resolve the parent's
    // gatsby config and return it in order [parentA, parentB, child]
    return mapSeries(
      themesList,
      async (spec: PluginEntry): Promise<Array<IThemeObj>> => {
        const themeObj = await resolveTheme(
          spec,
          configFilePath,
          false,
          themeDir
        )
        return processTheme(themeObj, { rootDir: themeDir })
      }
    ).then(arr =>
      flattenDeep(
        arr.concat([
          { themeName, themeConfig, themeSpec, themeDir, parentDir: rootDir },
        ])
      )
    )
  } else {
    // if a theme doesn't define additional themes, return the original theme
    return Promise.resolve([
      { themeName, themeConfig, themeSpec, themeDir, parentDir: rootDir },
    ])
  }
}

function normalizePluginEntry(
  plugin: PluginEntry,
  parentDir: string
): IPluginEntryWithParentDir {
  return {
    resolve: typeof plugin === `string` ? plugin : plugin.resolve,
    options: typeof plugin === `string` ? {} : plugin.options || {},
    parentDir,
  }
}

export async function loadThemes(
  config: IGatsbyConfigInput,
  { configFilePath, rootDir }: { configFilePath: string; rootDir: string }
): Promise<{
  config: IGatsbyConfigInput
  themes: Array<IThemeObj>
}> {
  const themesA = await mapSeries(
    config.plugins || [],
    async (themeSpec: PluginEntry) => {
      const themeObj = await resolveTheme(
        themeSpec,
        configFilePath,
        true,
        rootDir
      )
      return processTheme(themeObj, { rootDir })
    }
  ).then(arr => flattenDeep(arr))

  // log out flattened themes list to aid in debugging
  debug(themesA)

  // map over each theme, adding the theme itself to the plugins
  // list in the config for the theme. This enables the usage of
  // gatsby-node, etc in themes.
  return (
    mapSeries(
      themesA,
      ({ themeName, themeConfig = {}, themeSpec, themeDir, parentDir }) => {
        return {
          ...themeConfig,
          plugins: [
            ...(themeConfig.plugins || []).map(plugin =>
              normalizePluginEntry(plugin, themeDir)
            ),
            // theme plugin is last so it's gatsby-node, etc can override it's declared plugins, like a normal site.
            {
              resolve: themeName,
              options: typeof themeSpec === `string` ? {} : themeSpec.options,
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
        const mergedConfig = mergeGatsbyConfig(newConfig, {
          ...config,
          plugins: [
            ...(config.plugins || []).map(plugin =>
              normalizePluginEntry(plugin, rootDir)
            ),
          ],
        })

        mergedConfig.plugins = uniqWith(mergedConfig.plugins, isEqual)

        return {
          config: mergedConfig,
          themes: themesA,
        }
      })
  )
}
