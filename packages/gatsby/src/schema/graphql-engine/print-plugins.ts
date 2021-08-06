import * as fs from "fs-extra"
import { store } from "../../redux"
import { IGatsbyState } from "../../redux/types"

const schemaCustomizationAPIs = new Set([
  `setFieldsOnGraphQLNodeType`,
  `createSchemaCustomization`,
  `createResolvers`,
])

const excludePlugins = new Set([`internal-data-bridge`, `default-site-plugin`])

export async function printQueryEnginePlugins(): Promise<void> {
  // Emit file that imports required node APIs
  const schemaCustomizationPluginsPath =
    process.cwd() + `/.cache/query-engine-plugins.js`

  try {
    await fs.remove(schemaCustomizationPluginsPath)
  } catch (e) {
    // no-op
  }
  return await fs.writeFile(
    schemaCustomizationPluginsPath,
    renderSchemaCustomizationPlugins()
  )
}

function renderSchemaCustomizationPlugins(): string {
  const { flattenedPlugins } = store.getState()
  const schemaCustomizationPlugins = flattenedPlugins.filter(
    p =>
      !excludePlugins.has(p.name) &&
      p.nodeAPIs.some(api => schemaCustomizationAPIs.has(api))
  )
  const usedSubPlugins = findSubPlugins(
    schemaCustomizationPlugins,
    flattenedPlugins
  )
  return render(uniq(schemaCustomizationPlugins), uniq(usedSubPlugins))
}

function render(
  gatsbyNode: IGatsbyState["flattenedPlugins"],
  index: IGatsbyState["flattenedPlugins"]
): string {
  const imports: Array<string> = [
    ...gatsbyNode.map(
      (plugin, i) =>
        `import * as pluginGatsbyNode${i} from "${plugin.name}/gatsby-node"`
    ),
    ...index.map(
      (plugin, i) => `import * as pluginIndex${i} from "${plugin.name}"`
    ),
  ]
  const gatsbyNodeExports = gatsbyNode.map(
    (plugin, i) => `"${plugin.name}": pluginGatsbyNode${i},`
  )
  const indexExports = index.map(
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
