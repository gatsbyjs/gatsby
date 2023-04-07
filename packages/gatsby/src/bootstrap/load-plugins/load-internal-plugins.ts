import { slash } from "gatsby-core-utils"
import { uniqWith, isEqual } from "lodash"
import path from "path"
import reporter from "gatsby-cli/lib/reporter"
import { store } from "../../redux"
import {
  IPluginInfo,
  IPluginRefObject,
  IPluginRefOptions,
  ISiteConfig,
} from "./types"
import { processPlugin } from "./process-plugin"
import { createPluginId } from "./utils/create-id"
import { createFileContentHash } from "./utils/create-hash"
import {
  addGatsbyPluginCloudPluginWhenInstalled,
  addGatsbyPluginPreviewWhenInstalled,
  incompatibleGatsbyCloudPlugin,
  GATSBY_CLOUD_PLUGIN_NAME,
  GATSBY_PLUGIN_PREVIEW_NAME,
} from "./utils/handle-gatsby-cloud"
import { getResolvedFieldsForPlugin } from "../../utils/parcel/compile-gatsby-files"

const TYPESCRIPT_PLUGIN_NAME = `gatsby-plugin-typescript`

export function loadInternalPlugins(
  config: ISiteConfig = {},
  rootDir: string
): Array<IPluginInfo> {
  // Instantiate plugins.
  const plugins: Array<IPluginInfo> = []
  const configuredPluginNames = new Set()

  // Add internal plugins
  const internalPlugins = [
    `../../internal-plugins/dev-404-page`,
    `../../internal-plugins/load-babel-config`,
    `../../internal-plugins/internal-data-bridge`,
    `../../internal-plugins/prod-404-500`,
    `../../internal-plugins/webpack-theme-component-shadowing`,
    `../../internal-plugins/bundle-optimisations`,
    `../../internal-plugins/functions`,
  ].filter(Boolean) as Array<string>

  internalPlugins.forEach(relPath => {
    const absPath = path.join(__dirname, relPath)
    plugins.push(processPlugin(absPath, rootDir))
  })

  // Add plugins from the site config.
  if (config.plugins) {
    config.plugins.forEach(plugin => {
      const processedPlugin = processPlugin(plugin, rootDir)
      plugins.push(processedPlugin)
      configuredPluginNames.add(processedPlugin.name)
    })
  }

  // the order of all of these page-creators matters. The "last plugin wins",
  // so the user's site comes last, and each page-creator instance has to
  // match the plugin definition order before that. This works fine for themes
  // because themes have already been added in the proper order to the plugins
  // array
  plugins.forEach(plugin => {
    plugins.push(
      processPlugin(
        {
          resolve: require.resolve(`gatsby-plugin-page-creator`),
          options: {
            path: slash(path.join(plugin.resolve, `src/pages`)),
            pathCheck: false,
          },
        },
        rootDir
      )
    )
  })

  if (
    configuredPluginNames.has(GATSBY_CLOUD_PLUGIN_NAME) &&
    incompatibleGatsbyCloudPlugin(plugins)
  ) {
    reporter.panic(
      `Plugin gatsby-plugin-gatsby-cloud is not compatible with your gatsby version. Please upgrade to gatsby-plugin-gatsby-cloud@next`
    )
  }

  if (
    !configuredPluginNames.has(GATSBY_CLOUD_PLUGIN_NAME) &&
    (process.env.GATSBY_CLOUD === `true` || process.env.GATSBY_CLOUD === `1`)
  ) {
    addGatsbyPluginCloudPluginWhenInstalled(plugins, rootDir)
  }

  if (
    !configuredPluginNames.has(GATSBY_PLUGIN_PREVIEW_NAME) &&
    (process.env.GATSBY_CLOUD === `true` || process.env.GATSBY_CLOUD === `1`)
  ) {
    addGatsbyPluginPreviewWhenInstalled(plugins, rootDir)
  }

  // Support Typescript by default but allow users to override it
  if (!configuredPluginNames.has(TYPESCRIPT_PLUGIN_NAME)) {
    const processedTypeScriptPlugin = processPlugin(
      {
        resolve: require.resolve(TYPESCRIPT_PLUGIN_NAME),
        options: {
          // TODO(@mxstbr): Do not hard-code these defaults but infer them from the
          // pluginOptionsSchema of gatsby-plugin-typescript
          allExtensions: false,
          isTSX: false,
          jsxPragma: `React`,
        },
      },
      rootDir
    )
    plugins.push(processedTypeScriptPlugin)
  }

  // Add the site's default "plugin" i.e. gatsby-x files in root of site.
  plugins.push({
    resolve: slash(process.cwd()),
    id: createPluginId(`default-site-plugin`),
    name: `default-site-plugin`,
    version: createFileContentHash(process.cwd(), `gatsby-*`),
    pluginOptions: {
      plugins: [],
    },
    ...getResolvedFieldsForPlugin(rootDir, `default-site-plugin`),
  })

  const program = store.getState().program

  // default options for gatsby-plugin-page-creator
  let pageCreatorOptions: IPluginRefOptions | undefined = {
    path: slash(path.join(program.directory, `src/pages`)),
    pathCheck: false,
  }

  if (config.plugins) {
    const pageCreatorPlugin = config.plugins.find(
      (plugin): plugin is IPluginRefObject =>
        typeof plugin !== `string` &&
        plugin.resolve === `gatsby-plugin-page-creator` &&
        slash((plugin.options && plugin.options.path) || ``) ===
          slash(path.join(program.directory, `src/pages`))
    )
    if (pageCreatorPlugin) {
      // override the options if there are any user specified options
      pageCreatorOptions = pageCreatorPlugin.options
    }
  }

  const processedPageCreatorPlugin = processPlugin(
    {
      resolve: require.resolve(`gatsby-plugin-page-creator`),
      options: pageCreatorOptions,
    },
    rootDir
  )

  plugins.push(processedPageCreatorPlugin)

  // Partytown plugin collects usage of <Script strategy={"off-main-thread"} />
  // in `wrapRootElement`, so we have to make sure it's the last one running to be able to
  // collect scripts that users might inject in their `wrapRootElement`
  plugins.push(
    processPlugin(
      path.join(__dirname, `../../internal-plugins/partytown`),
      rootDir
    )
  )

  const uniquePlugins = uniqWith(plugins, isEqual)

  return uniquePlugins
}
