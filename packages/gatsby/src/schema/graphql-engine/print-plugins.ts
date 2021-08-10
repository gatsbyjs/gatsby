/* eslint @typescript-eslint/no-unused-vars: ["error", { "ignoreRestSiblings": true }] */
import * as fs from "fs-extra"
import * as path from "path"
import { store } from "../../redux"
import { IGatsbyState } from "../../redux/types"

const schemaCustomizationAPIs = new Set([
  `setFieldsOnGraphQLNodeType`,
  `createSchemaCustomization`,
  `createResolvers`,
])

const excludePlugins = new Set([`internal-data-bridge`, `default-site-plugin`])
// Emit file that imports required node APIs
const schemaCustomizationPluginsPath =
  process.cwd() + `/.cache/query-engine-plugins.js`

export async function printQueryEnginePlugins(): Promise<void> {
  try {
    await fs.remove(schemaCustomizationPluginsPath)
  } catch (e) {
    // no-op
  }
  return await fs.writeFile(
    schemaCustomizationPluginsPath,
    renderQueryEnginePlugins()
  )
}

function renderQueryEnginePlugins(): string {
  const { flattenedPlugins } = store.getState()
  const usedPlugins = flattenedPlugins.filter(
    p =>
      !excludePlugins.has(p.name) &&
      p.nodeAPIs.some(api => schemaCustomizationAPIs.has(api))
  )
  const usedSubPlugins = findSubPlugins(usedPlugins, flattenedPlugins)
  return render(usedPlugins, usedSubPlugins)
}

function relativePluginPath(resolve: string): string {
  return path.relative(path.dirname(schemaCustomizationPluginsPath), resolve)
}

function render(
  usedPlugins: IGatsbyState["flattenedPlugins"],
  usedSubPlugins: IGatsbyState["flattenedPlugins"]
): string {
  const uniqGatsbyNode = uniq(usedPlugins)
  const uniqIndex = uniq(usedSubPlugins)

  const sanitizedUsedPlugins = usedPlugins.map(plugin => {
    // Remove pluginOptions as it's separately bundled with gatsby-config.js
    // Remove other stuff as it's not needed
    const { pluginOptions, resolve, pluginFilepath, ...rest } = plugin
    return { ...rest }
  })

  const imports: Array<string> = [
    ...uniqGatsbyNode.map(
      (plugin, i) =>
        `import * as pluginGatsbyNode${i} from "${relativePluginPath(
          plugin.resolve
        )}/gatsby-node"`
    ),
    ...uniqIndex.map(
      (plugin, i) =>
        `import * as pluginIndex${i} from "${relativePluginPath(
          plugin.resolve
        )}"`
    ),
  ]
  const gatsbyNodeExports = uniqGatsbyNode.map(
    (plugin, i) => `"${plugin.name}": pluginGatsbyNode${i},`
  )
  const indexExports = uniqIndex.map(
    (plugin, i) => `  "${plugin.name}": pluginIndex${i},`
  )
  const output = `
${imports.join(`\n`)}

export const gatsbyNodes = {
${gatsbyNodeExports.join(`\n`)}
}

export const indexes = {
${indexExports.join(`\n`)}
}

export const flattenedPlugins = ${JSON.stringify(sanitizedUsedPlugins)}
  `
  return output
}

function findSubPlugins(
  plugins: IGatsbyState["flattenedPlugins"],
  allFlattenedPlugins: IGatsbyState["flattenedPlugins"]
): IGatsbyState["flattenedPlugins"] {
  const usedSubPluginNames = new Set<string>(
    plugins
      .flatMap(plugin => plugin?.pluginOptions?.plugins ?? [])
      .map(plugin => plugin[`name`])
      .filter((p: unknown): p is string => typeof p === `string`)
  )
  return allFlattenedPlugins.filter(p => usedSubPluginNames.has(p.name))
}

function uniq(
  plugins: IGatsbyState["flattenedPlugins"]
): IGatsbyState["flattenedPlugins"] {
  return Array.from(new Map(plugins.map(p => [p.name, p])).values())
}
