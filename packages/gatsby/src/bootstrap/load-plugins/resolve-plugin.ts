import path from "path"
import fs from "fs"
import { slash, createRequireFromPath } from "gatsby-core-utils"
import { warnOnIncompatiblePeerDependency } from "./validate"
import { PackageJson } from "../../.."
import { IPluginInfo, PluginRef } from "./types"
import { createPluginId } from "./utils/create-id"
import { createFileContentHash } from "./utils/create-hash"
import reporter from "gatsby-cli/lib/reporter"
import { isString } from "lodash"
import { checkLocalPlugin } from "./utils/check-local-plugin"
import { getResolvedFieldsForPlugin } from "../../utils/parcel/compile-gatsby-files"

/**
 * @param plugin
 * This should be a plugin spec object where possible but can also be the
 * name of a plugin.
 *
 * When it is a name, it can be a name of a local plugin, the name of a plugin
 * located in node_modules, or a Gatsby internal plugin. In the last case the
 * plugin will be an absolute path.
 * @param rootDir
 * This is the project location, from which are found the plugins
 */
export function resolvePlugin(plugin: PluginRef, rootDir: string): IPluginInfo {
  const pluginName = isString(plugin) ? plugin : plugin.resolve

  // Handle local plugins
  const { validLocalPlugin, localPluginPath = `` } = checkLocalPlugin(
    plugin,
    rootDir
  )

  if (validLocalPlugin && localPluginPath) {
    const packageJSON = JSON.parse(
      fs.readFileSync(`${localPluginPath}/package.json`, `utf-8`)
    ) as PackageJson
    const name = packageJSON.name || pluginName
    warnOnIncompatiblePeerDependency(name, packageJSON)

    return {
      resolve: localPluginPath,
      name,
      id: createPluginId(name),
      version:
        packageJSON?.version || createFileContentHash(localPluginPath, `**`),
      ...getResolvedFieldsForPlugin(rootDir, name),
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
    if (process.env.gatsby_log_level === `verbose`) {
      reporter.panicOnBuild(
        `plugin "${pluginName} threw the following error:\n`,
        err
      )
    } else {
      reporter.panicOnBuild(
        `There was a problem loading plugin "${pluginName}". Perhaps you need to install its package?\nUse --verbose to see actual error.`
      )
    }
    throw new Error(`unreachable`)
  }
}
