import { isString, merge } from "lodash"
import { slash } from "gatsby-core-utils"
import * as fs from "fs"
import * as path from "path"
import * as crypto from "crypto"
import * as glob from "glob"
import { warnOnIncompatiblePeerDependency } from "./validate"
import { store } from "../../redux"
import { sync } from "fs-exists-cached"
import { createNodeId } from "../../utils/create-node-id"
import { createRequireFromPath } from "gatsby-core-utils"

function createFileContentHash(root: string, globPattern: string): string {
  const hash: crypto.Hash = crypto.createHash(`md5`)
  const files = glob.sync(`${root}/${globPattern}`, { nodir: true })

  files.forEach(function callbackFn(filePath: string): void {
    hash.update(fs.readFileSync(filePath))
  })

  return hash.digest(`hex`)
}

/**
 * Make sure key is unique to plugin options. E.g. there could
 * be multiple source-filesystem plugins, with different names
 * (docs, blogs).
 * @param {*} name Name of the plugin
 * @param {*} pluginObject
 */
function createPluginId(
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pluginObject: void | IPlugin
): string {
  return createNodeId(
    name +
      // eslint-disable-next-line prettier/prettier
      ((pluginObject !== undefined && pluginObject.options !== undefined)
        ? JSON.stringify(pluginObject.options)
        : ``),
    `Plugin`
  )
}

interface IResolvedPlugin {
  resolve: string
  name: string
  id: string
  version: string
}

/**
 * @typedef {Object} PluginInfo
 * @property {string} resolve The absolute path to the plugin
 * @property {string} name The plugin name
 * @property {string} version The plugin version (can be content hash)
 */

/**
 * resolvePlugin
 * @param {string} pluginName
 * This can be a name of a local plugin, the name of a plugin located in
 * node_modules, or a Gatsby internal plugin. In the last case the pluginName
 * will be an absolute path.
 * @param {string} rootDir
 * This is the project location, from which are found the plugins
 * @return {PluginInfo}
 */
export function resolvePlugin(
  pluginName: string,
  rootDir?: string
): IResolvedPlugin {
  // Only find plugins when we're not given an absolute path
  if (!sync(pluginName)) {
    // Find the plugin in the local plugins folder
    const resolvedPath = slash(path.resolve(`./plugins/${pluginName}`))

    if (sync(resolvedPath)) {
      if (sync(`${resolvedPath}/package.json`)) {
        const packageJSON = JSON.parse(
          fs.readFileSync(`${resolvedPath}/package.json`, `utf-8`)
        )
        const name = packageJSON.name || pluginName
        warnOnIncompatiblePeerDependency(name, packageJSON)

        return {
          resolve: resolvedPath,
          name,
          id: createPluginId(name),
          version:
            packageJSON.version || createFileContentHash(resolvedPath, `**`),
        }
      } else {
        // Make package.json a requirement for local plugins too
        throw new Error(`Plugin ${pluginName} requires a package.json file`)
      }
    }
  }

  /**
   * Here we have an absolute path to an internal plugin, or a name of a module
   * which should be located in node_modules.
   */
  try {
    const requireSource =
      rootDir !== null
        ? createRequireFromPath(`${rootDir}/:internal:`)
        : require

    // If the path is absolute, resolve the directory of the internal plugin,
    // otherwise resolve the directory containing the package.json
    const resolvedPath = slash(
      path.dirname(
        requireSource.resolve(
          path.isAbsolute(pluginName)
            ? pluginName
            : `${pluginName}/package.json`
        )
      )
    )

    const packageJSON = JSON.parse(
      fs.readFileSync(`${resolvedPath}/package.json`, `utf-8`)
    )
    warnOnIncompatiblePeerDependency(packageJSON.name, packageJSON)

    return {
      resolve: resolvedPath,
      id: createPluginId(packageJSON.name),
      name: packageJSON.name,
      version: packageJSON.version,
    }
  } catch (err) {
    throw new Error(
      `Unable to find plugin "${pluginName}". Perhaps you need to install its package?`
    )
  }
}

interface IOptions {
  plugins: IPlugin[]
  path: string
  pathCheck: boolean
}

interface IPreprocessPlugin extends IResolvedPlugin {
  options: IOptions
  resolve: string
}

interface IProcessedPluginString extends IResolvedPlugin {
  options: IOptions
  resolve: string
}

interface IProcessedPluginObject {
  options: IOptions
  resolve: string
}

interface IProcessedTestPluginObject {
  id: string
  name: string
  resolve: string
  options: IOptions
}

interface IConfig {
  plugins?: IPlugin[]
}

export type IPlugin =
  | IProcessedPluginString
  | IProcessedPluginObject
  | IProcessedTestPluginObject

export function loadPlugins(config: IConfig = {}, rootDir?: string): IPlugin[] {
  // Instantiate plugins.
  const plugins: IPlugin[] = []

  // Create fake little site with a plugin for testing this
  // w/ snapshots. Move plugin processing to its own module.
  // Also test adding to redux store.
  function processPlugin(plugin: IPlugin | string): IPlugin {
    if (isString(plugin)) {
      const info: IResolvedPlugin = resolvePlugin(plugin, rootDir)

      const stringPlugin: IProcessedPluginString = {
        ...info,
        options: {
          plugins: [],
          path: ``,
          pathCheck: false,
        },
      }

      return stringPlugin
    } else {
      ;(plugin as IPreprocessPlugin).options =
        (plugin as IPreprocessPlugin).options || {}

      // Plugins can have plugins.
      const subplugins: IPlugin[] = []

      if ((plugin as IPreprocessPlugin).options.plugins !== undefined) {
        ;(plugin as IPreprocessPlugin).options.plugins.forEach(
          function callbackFn(p): void {
            subplugins.push(processPlugin(p))
          }
        )
        ;(plugin as IPreprocessPlugin).options.plugins = subplugins
      }

      // Add some default values for tests as we don't actually
      // want to try to load anything during tests.
      if (plugin.resolve === `___TEST___`) {
        const name = `TEST`

        return {
          id: createPluginId(name, plugin as IProcessedTestPluginObject),
          name,
          options: {
            plugins: [],
            path: ``,
            pathCheck: false,
          },
          resolve: `__TEST__`,
        }
      }

      const info: IResolvedPlugin = resolvePlugin(plugin.resolve, rootDir)

      const object = { plugins: [], path: ``, pathCheck: false }

      return {
        ...info,
        id: createPluginId(info.name, plugin),
        options: plugin.options ? merge(object, plugin.options) : object,
      }
    }
  }

  // Add internal plugins
  const internalPlugins: string[] = [
    `../../internal-plugins/dev-404-page`,
    `../../internal-plugins/load-babel-config`,
    `../../internal-plugins/internal-data-bridge`,
    `../../internal-plugins/prod-404`,
    `../../internal-plugins/webpack-theme-component-shadowing`,
  ]

  internalPlugins.forEach(function callbackFn(relPath: string): void {
    const absPath: string = path.join(__dirname, relPath)

    plugins.push(processPlugin(absPath))
  })

  // Add plugins from the site config.
  if (config.plugins) {
    config.plugins.forEach((plugin) => {
      plugins.push(processPlugin(plugin))
    })
  }

  // the order of all of these page-creators matters. The "last plugin wins",
  // so the user's site comes last, and each page-creator instance has to
  // match the plugin definition order before that. This works fine for themes
  // because themes have already been added in the proper order to the plugins
  // array
  plugins.forEach(function callbackFn(plugin) {
    plugins.push(
      processPlugin({
        resolve: require.resolve(`gatsby-plugin-page-creator`),
        options: {
          plugins: [],
          path: slash(path.join(plugin.resolve, `src/pages`)),
          pathCheck: false,
        },
      })
    )
  })

  // Add the site's default "plugin" i.e. gatsby-x files in root of site.
  plugins.push({
    resolve: slash(process.cwd()),
    id: createPluginId(`default-site-plugin`),
    name: `default-site-plugin`,
    version: createFileContentHash(process.cwd(), `gatsby-*`),
    options: {
      plugins: [],
      path: ``,
      pathCheck: false,
    },
  })

  const program = store.getState().program

  // default options for gatsby-plugin-page-creator
  let pageCreatorOptions = {
    path: slash(path.join(program.directory, `src/pages`)),
    pathCheck: false,
    plugins: [],
  }

  if (config.plugins !== undefined) {
    const pageCreatorPlugin = config.plugins.find(function predicate(
      plugin
    ): boolean {
      return (
        plugin.resolve === `gatsby-plugin-page-creator` &&
        slash(plugin.options.path || ``) ===
          slash(path.join(program.directory, `src/pages`))
      )
    })

    if (pageCreatorPlugin) {
      // override the options if there are any user specified options
      const { path, pathCheck } = pageCreatorPlugin.options
      pageCreatorOptions = { path, pathCheck, plugins: [] }
    }
  }

  plugins.push(
    processPlugin({
      resolve: require.resolve(`gatsby-plugin-page-creator`),
      options: pageCreatorOptions,
    })
  )

  return plugins
}
