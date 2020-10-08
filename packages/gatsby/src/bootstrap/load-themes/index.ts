import { createRequireFromPath } from "gatsby-core-utils"
import path from "path"
import { mergeGatsbyConfig } from "../../utils/merge-gatsby-config"
import Bluebird from "bluebird"
import _ from "lodash"
import { preferDefault } from "../prefer-default"
import { getConfigFile } from "../get-config-file"
import { resolvePlugin } from "../load-plugins/load"
import reporter from "gatsby-cli/lib/reporter"
import Debug from "debug"
import { GatsbyConfig, IPluginRefOptions, PluginRef } from "../../../"

const debug = Debug(`gatsby:load-themes`)

interface IResolvedTheme {
  themeName: string
  themeConfig: GatsbyConfig
  themeSpec: PluginRef
  themeDir: string
  parentDir: string
  configFilePath: string
}
// get the gatsby-config file for a theme
const resolveTheme = async (
  themeSpec: PluginRef,
  configFileThatDeclaredTheme: string,
  isMainConfig = false,
  rootDir: string
): Promise<IResolvedTheme> => {
  const themeName =
    typeof themeSpec === `string` ? themeSpec : themeSpec.resolve
  let themeDir = ``
  try {
    const scopedRequire = createRequireFromPath(
      `${rootDir}/:internal:`
    ) as NodeRequire
    // theme is an node-resolvable module
    themeDir = path.dirname(scopedRequire.resolve(themeName))
  } catch (e) {
    let pathToLocalTheme = ``

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
      const nodeResolutionPaths = module.paths.map((p: string): string =>
        path.join(p, themeName)
      )
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
  const theme = preferDefault(configModule) as
    | GatsbyConfig
    | ((options?: IPluginRefOptions) => GatsbyConfig)

  // if theme is a function, call it with the themeConfig
  const themeConfig =
    typeof theme === `function`
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

interface IProcessThemeOptions {
  useLegacyThemes: boolean
  rootDir: string
}

interface IProcessedTheme {
  themeName: string
  themeConfig: GatsbyConfig
  themeSpec: PluginRef
  themeDir: string
  parentDir: string
}

type ProcessedThemes = Array<IProcessedTheme | ProcessedThemes>

// single iteration of a recursive function that resolve parent themes
// It's recursive because we support child themes declaring parents and
// have to resolve all the way `up the tree` of parent/children relationships
//
// Theoretically, there could be an infinite loop here but in practice there is
// no use case for a loop so I expect that to only happen if someone is very
// off track and creating their own set of themes
const processTheme = (
  {
    themeName,
    themeConfig,
    themeSpec,
    themeDir,
    configFilePath,
  }: IResolvedTheme,
  { useLegacyThemes, rootDir }: IProcessThemeOptions
): Promise<ProcessedThemes> => {
  const themesList = useLegacyThemes
    ? themeConfig?.__experimentalThemes
    : themeConfig?.plugins
  // Gatsby themes don't have to specify a gatsby-config.js (they might only use gatsby-node, etc)
  // in this case they're technically plugins, but we should support it anyway
  // because we can't guarantee which files theme creators create first
  if (themeConfig && themesList) {
    // for every parent theme a theme defines, resolve the parent's
    // gatsby config and return it in order [parentA, parentB, child]
    return Bluebird.mapSeries(
      themesList,
      async (spec: PluginRef): Promise<ProcessedThemes> => {
        const themeObj = await resolveTheme(
          spec,
          configFilePath,
          false,
          themeDir
        )
        return processTheme(themeObj, { useLegacyThemes, rootDir: themeDir })
      }
    ).then(
      (arr: ProcessedThemes): ProcessedThemes =>
        arr.concat([
          { themeName, themeConfig, themeSpec, themeDir, parentDir: rootDir },
        ])
    )
  } else {
    // if a theme doesn't define additional themes, return the original theme
    return Promise.resolve([
      { themeName, themeConfig, themeSpec, themeDir, parentDir: rootDir },
    ])
  }
}

interface ILoadThemesOptions {
  useLegacyThemes?: boolean
  configFilePath: string
  rootDir: string
}

interface ILoadedThemes {
  config: GatsbyConfig
  themes: Array<IProcessedTheme>
}

export default async function loadThemes(
  config: GatsbyConfig,
  { useLegacyThemes = false, configFilePath, rootDir }: ILoadThemesOptions
): Promise<ILoadedThemes> {
  const plugins = useLegacyThemes ? config.__experimentalThemes : config.plugins
  const themesA = await Bluebird.mapSeries(
    plugins || [],
    async (themeSpec): Promise<ProcessedThemes> => {
      const themeObj = await resolveTheme(
        themeSpec,
        configFilePath,
        true,
        rootDir
      )
      return processTheme(themeObj, { useLegacyThemes, rootDir })
    }
  ).then(
    (arr: Array<ProcessedThemes>): Array<IProcessedTheme> => _.flattenDeep(arr)
  )

  // log out flattened themes list to aid in debugging
  debug(themesA)

  // map over each theme, adding the theme itself to the plugins
  // list in the config for the theme. This enables the usage of
  // gatsby-node, etc in themes.
  return (
    Bluebird.mapSeries(
      themesA,
      ({
        themeName,
        themeConfig = {},
        themeSpec,
        themeDir,
        parentDir,
      }: IProcessedTheme): GatsbyConfig => {
        return {
          ...themeConfig,
          plugins: [
            ...(themeConfig.plugins || []).map(
              (plugin: PluginRef): PluginRef => {
                return {
                  resolve: typeof plugin === `string` ? plugin : plugin.resolve,
                  options: typeof plugin === `string` ? {} : plugin.options,
                  parentDir: themeDir,
                }
              }
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
      .then(
        (newConfig: GatsbyConfig): ILoadedThemes => {
          return {
            config: mergeGatsbyConfig(newConfig, config),
            themes: themesA,
          }
        }
      )
  )
}
