import { NPMPackage, GatsbyPlugin } from "gatsby-recipes"
import reporter from "../reporter"
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
    const result = await NPMPackage.create({ root }, { name: plugin })
    reporter.info(result._message)
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
    const result = await GatsbyPlugin.create(
      { root },
      { name: pluginName, options, key: pluginKey }
    )
    reporter.info(result._message)
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
