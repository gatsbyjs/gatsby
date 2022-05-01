import { PluginRef } from "../types"
import { sync as existsSync } from "fs-exists-cached"
import { slash } from "gatsby-core-utils"
import path from "path"

/**
 * Checks if a plugin is a valid local plugin and returns the resolved path if it is.
 */
export function checkLocalPlugin(
  plugin: PluginRef,
  rootDir: string
): { validLocalPlugin: boolean; localPluginPath?: string } {
  const pluginName = typeof plugin === `string` ? plugin : plugin.resolve

  // Make sure the plugin exists relatively
  if (existsSync(pluginName) || !rootDir) {
    return {
      validLocalPlugin: false,
    }
  }

  const resolvedPath = slash(path.join(rootDir, `plugins/${pluginName}`))

  if (!existsSync(resolvedPath)) {
    return {
      validLocalPlugin: false,
    }
  }

  const resolvedPackageJson = existsSync(`${resolvedPath}/package.json`)

  // package.json is a requirement for local plugins
  if (!resolvedPackageJson) {
    throw new Error(`Local plugin ${pluginName} requires a package.json file`)
  }

  return {
    validLocalPlugin: true,
    localPluginPath: resolvedPath,
  }
}
