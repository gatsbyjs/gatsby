export function listPlugins({ root }: { root: string }): Array<string> {
  const parsedPlugins: Array<
    string | { resolve: string; options: Record<string, any> }
  > = require(`${root}/gatsby-config`)?.plugins

  if (!parsedPlugins) {
    return []
  }

  const plugins = parsedPlugins.map(plugin => {
    if (typeof plugin === `string`) {
      return plugin
    } else if (plugin.resolve) {
      return plugin.resolve
    } else {
      return `Plugin could not be recognized`
    }
  })

  return plugins
}
