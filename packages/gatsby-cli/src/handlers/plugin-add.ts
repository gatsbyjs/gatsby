import reporter from "../reporter"
import { GatsbyPluginCreate, NPMPackageCreate } from "./plugin-add-utils"

const normalizePluginName = (plugin: string): string => {
  if (plugin.startsWith(`gatsby-`)) {
    return plugin
  }
  if (
    plugin.startsWith(`source-`) ||
    plugin.startsWith(`transformer-`) ||
    plugin.startsWith(`plugin-`)
  ) {
    return `gatsby-${plugin}`
  }
  return `gatsby-plugin-${plugin}`
}

async function installPluginPackage(
  plugin: string,
  root: string
): Promise<void> {
  const installTimer = reporter.activityTimer(`Installing ${plugin}`)

  installTimer.start()
  reporter.info(`Installing ${plugin}`)
  try {
    await NPMPackageCreate({ root, name: plugin })
    reporter.info(`Installed NPM package ${plugin}`)
  } catch (err) {
    reporter.error(JSON.parse(err)?.message)
    installTimer.setStatus(`FAILED`)
  }
  installTimer.end()
}

async function installPluginConfig(
  plugin: string,
  options: Record<string, unknown> | undefined,
  root: string
): Promise<void> {
  // Plugins can optionally include a key, to allow duplicates
  const [pluginName, pluginKey] = plugin.split(`:`)

  const installTimer = reporter.activityTimer(
    `Adding ${pluginName} ${pluginKey ? `(${pluginKey}) ` : ``}to gatsby-config`
  )

  installTimer.start()
  reporter.info(`Adding ${pluginName}`)
  try {
    await GatsbyPluginCreate({
      root,
      name: pluginName,
      options,
      key: pluginKey,
    })
    reporter.info(`Installed ${pluginName || pluginKey} in gatsby-config`)
  } catch (err) {
    reporter.error(JSON.parse(err)?.message)
    installTimer.setStatus(`FAILED`)
  }
  installTimer.end()
}

export async function addPlugins(
  plugins: Array<string>,
  pluginOptions: Record<string, Record<string, unknown>>,
  directory: string,
  packages: Array<string> = []
): Promise<void> {
  if (!plugins?.length) {
    reporter.error(`Please specify a plugin to install`)
    return
  }

  const pluginList = plugins.map(normalizePluginName)

  await Promise.all(
    packages.map(plugin => installPluginPackage(plugin, directory))
  )
  await Promise.all(
    pluginList.map(plugin =>
      installPluginConfig(plugin, pluginOptions[plugin], directory)
    )
  )
}
