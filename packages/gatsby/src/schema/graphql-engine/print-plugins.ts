/* eslint @typescript-eslint/no-unused-vars: ["error", { "ignoreRestSiblings": true }] */
import * as fs from "fs-extra"
import * as path from "path"
import * as _ from "lodash"
import { slash } from "gatsby-core-utils"
import { store } from "../../redux"
import { IGatsbyState } from "../../redux/types"
import { importGatsbyPlugin } from "../../utils/import-gatsby-plugin"

export const schemaCustomizationAPIs = new Set([
  `setFieldsOnGraphQLNodeType`,
  `createSchemaCustomization`,
  `createResolvers`,
])

const excludePlugins = new Set([`internal-data-bridge`])
const includePlugins = new Set([`gatsby-plugin-sharp`])

// Emit file that imports required node APIs
const schemaCustomizationPluginsPath =
  process.cwd() + `/.cache/query-engine-plugins.js`

export async function printQueryEnginePlugins(): Promise<void> {
  try {
    await fs.remove(schemaCustomizationPluginsPath)
  } catch (e) {
    // no-op
  }
  const queryEnginePlugins = await renderQueryEnginePlugins()
  return await fs.writeFile(schemaCustomizationPluginsPath, queryEnginePlugins)
}

async function renderQueryEnginePlugins(): Promise<string> {
  const { flattenedPlugins } = store.getState()
  const usedPlugins = flattenedPlugins.filter(
    p =>
      includePlugins.has(p.name) ||
      (!excludePlugins.has(p.name) &&
        p.nodeAPIs.some(api => schemaCustomizationAPIs.has(api)))
  )
  const usedSubPlugins = findSubPlugins(usedPlugins, flattenedPlugins)
  const result = await render(usedPlugins, usedSubPlugins)
  return result
}

function relativePluginPath(resolve: string): string {
  return slash(
    path.relative(path.dirname(schemaCustomizationPluginsPath), resolve)
  )
}

async function render(
  usedPlugins: IGatsbyState["flattenedPlugins"],
  usedSubPlugins: IGatsbyState["flattenedPlugins"]
): Promise<string> {
  const uniqSubPlugins = uniq(usedSubPlugins)

  const sanitizedUsedPlugins = usedPlugins.map((plugin, i) => {
    // TODO: We don't support functions in pluginOptions here
    return {
      ...plugin,
      resolve: ``,
      pluginFilepath: ``,
      subPluginPaths: undefined,
      importKey: i + 1,
    }
  })

  const pluginsWithWorkers = await filterPluginsWithWorkers(usedPlugins)

  const subPluginModuleToImportNameMapping = new Map<string, string>()
  const imports: Array<string> = [
    ...usedPlugins.map(
      (plugin, i) =>
        `import * as pluginGatsbyNode${i} from "${relativePluginPath(
          plugin.resolve
        )}/gatsby-node"`
    ),
    ...pluginsWithWorkers.map(
      (plugin, i) =>
        `import * as pluginGatsbyWorker${i} from "${relativePluginPath(
          plugin.resolve
        )}/gatsby-worker"`
    ),
    ...uniqSubPlugins.map((plugin, i) => {
      const importName = `subPlugin${i}`
      subPluginModuleToImportNameMapping.set(plugin.modulePath!, importName)
      return `import * as ${importName} from "${relativePluginPath(
        plugin.modulePath!
      )}"`
    }),
  ]
  const gatsbyNodeExports = usedPlugins.map(
    (plugin, i) =>
      `{ name: "${plugin.name}", module: pluginGatsbyNode${i}, importKey: ${
        i + 1
      } },`
  )
  const gatsbyWorkerExports = pluginsWithWorkers.map(
    (plugin, i) =>
      `{ name: "${plugin.name}", module: pluginGatsbyWorker${i}, importKey: ${
        i + 1
      } },`
  )
  const output = `
${imports.join(`\n`)}

export const gatsbyNodes = [
${gatsbyNodeExports.join(`\n`)}
]

export const gatsbyWorkers = [
${gatsbyWorkerExports.join(`\n`)}
]

export const flattenedPlugins =
  ${JSON.stringify(
    sanitizedUsedPlugins.map(plugin => {
      return {
        ...plugin,
        pluginOptions: _.cloneDeepWith(
          plugin.pluginOptions,
          (value: any): any => {
            if (
              typeof value === `object` &&
              value !== null &&
              value.module &&
              value.modulePath
            ) {
              const { module, modulePath, ...subPlugin } = value
              return {
                ...subPlugin,
                module: `_SKIP_START_${subPluginModuleToImportNameMapping.get(
                  modulePath
                )}_SKIP_END_`,
                resolve: ``,
                pluginFilepath: ``,
              }
            }
            return undefined
          }
        ),
      }
    }),
    null,
    2
  ).replace(/"_SKIP_START_|_SKIP_END_"/g, ``)}
`
  return output
}

async function filterPluginsWithWorkers(
  plugins: IGatsbyState["flattenedPlugins"]
): Promise<IGatsbyState["flattenedPlugins"]> {
  const filteredPlugins: Array<any> = []

  for (const plugin of plugins) {
    try {
      const pluginWithWorker = await importGatsbyPlugin(plugin, `gatsby-worker`)
      if (pluginWithWorker) {
        filteredPlugins.push(plugin)
      }
    } catch (_) {
      // Do nothing
    }
  }

  return filteredPlugins
}

type ArrayElement<ArrayType extends Array<unknown>> = ArrayType extends Array<
  infer ElementType
>
  ? ElementType
  : never

function getSubpluginsByPluginPath(
  parentPlugin: ArrayElement<IGatsbyState["flattenedPlugins"]>,
  path: string
): IGatsbyState["flattenedPlugins"] {
  const segments = path.split(`.`)
  let roots: Array<any> = [parentPlugin.pluginOptions]

  for (const segment of segments) {
    if (segment === `[]`) {
      roots = roots.flat()
    } else {
      roots = roots.map(root => root[segment])
    }
  }
  roots = roots.flat()

  return roots
}

function findSubPlugins(
  plugins: IGatsbyState["flattenedPlugins"],
  allFlattenedPlugins: IGatsbyState["flattenedPlugins"]
): IGatsbyState["flattenedPlugins"] {
  const usedSubPluginResolves = new Set<string>(
    plugins
      .flatMap(plugin => {
        if (plugin.subPluginPaths) {
          const subPlugins: IGatsbyState["flattenedPlugins"] = []
          for (const subPluginPath of plugin.subPluginPaths) {
            subPlugins.push(...getSubpluginsByPluginPath(plugin, subPluginPath))
          }
          return subPlugins
        }

        return []
      })
      .map(plugin => plugin[`resolve`])
      .filter((p: unknown): p is string => typeof p === `string`)
  )
  return allFlattenedPlugins.filter(
    p => usedSubPluginResolves.has(p.resolve) && !!p.modulePath
  )
}

function uniq(
  plugins: IGatsbyState["flattenedPlugins"]
): IGatsbyState["flattenedPlugins"] {
  return Array.from(new Map(plugins.map(p => [p.resolve, p])).values())
}
