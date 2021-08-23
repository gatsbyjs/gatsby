/* eslint @typescript-eslint/no-unused-vars: ["error", { "ignoreRestSiblings": true }] */
import * as fs from "fs-extra"
import * as path from "path"
import * as _ from "lodash"
import { slash } from "gatsby-core-utils"
import { store } from "../../redux"
import { IGatsbyState } from "../../redux/types"
import { requireGatsbyPlugin } from "../../utils/require-gatsby-plugin"

const schemaCustomizationAPIs = new Set([
  `setFieldsOnGraphQLNodeType`,
  `createSchemaCustomization`,
  `createResolvers`,
])

const excludePlugins = new Set([`internal-data-bridge`, `default-site-plugin`])
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
  return await fs.writeFile(
    schemaCustomizationPluginsPath,
    renderQueryEnginePlugins()
  )
}

function renderQueryEnginePlugins(): string {
  const { flattenedPlugins } = store.getState()
  const usedPlugins = flattenedPlugins.filter(
    p =>
      includePlugins.has(p.name) ||
      (!excludePlugins.has(p.name) &&
        p.nodeAPIs.some(api => schemaCustomizationAPIs.has(api)))
  )
  const usedSubPlugins = findSubPlugins(usedPlugins, flattenedPlugins)
  return render(usedPlugins, usedSubPlugins)
}

function relativePluginPath(resolve: string): string {
  return slash(
    path.relative(path.dirname(schemaCustomizationPluginsPath), resolve)
  )
}

function render(
  usedPlugins: IGatsbyState["flattenedPlugins"],
  usedSubPlugins: IGatsbyState["flattenedPlugins"]
): string {
  const uniqGatsbyNode = uniq(usedPlugins)
  const uniqSubPlugins = uniq(usedSubPlugins)

  const sanitizedUsedPlugins = usedPlugins.map(plugin => {
    // TODO: We don't support functions in pluginOptions here
    return {
      ...plugin,
      resolve: ``,
      pluginFilepath: ``,
      subPluginPaths: undefined,
    }
  })

  const pluginsWithWorkers = filterPluginsWithWorkers(uniqGatsbyNode)

  const subPluginModuleToImportNameMapping = new Map<string, string>()
  const imports: Array<string> = [
    ...uniqGatsbyNode.map(
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
    ...uniqSubPlugins
      .filter(plugin => !!plugin.modulePath)
      .map((plugin, i) => {
        const importName = `subPlugin${i}`
        subPluginModuleToImportNameMapping.set(plugin.modulePath!, importName)
        return `import * as ${importName} from "${relativePluginPath(
          plugin.modulePath!
        )}"`
      }),
  ]
  const gatsbyNodeExports = uniqGatsbyNode.map(
    (plugin, i) => `"${plugin.name}": pluginGatsbyNode${i},`
  )
  const gatsbyWorkerExports = pluginsWithWorkers.map(
    (plugin, i) => `"${plugin.name}": pluginGatsbyWorker${i},`
  )
  const indexExports = uniqSubPlugins.map(
    (plugin, i) => `  "${plugin.name}": subPlugin${i},`
  )
  const output = `
${imports.join(`\n`)}

export const gatsbyNodes = {
${gatsbyNodeExports.join(`\n`)}
}

export const gatsbyWorkers = {
${gatsbyWorkerExports.join(`\n`)}
}

export const indexes = {
${indexExports.join(`\n`)}
}

export const flattenedPlugins =
  ${JSON.stringify(
    sanitizedUsedPlugins.map(plugin => {
      return {
        ...plugin,
        pluginOptions: _.cloneDeepWith(
          plugin.pluginOptions,
          (value: any): any => {
            if (typeof value === `object` && value.module && value.modulePath) {
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

function filterPluginsWithWorkers(
  plugins: IGatsbyState["flattenedPlugins"]
): IGatsbyState["flattenedPlugins"] {
  return plugins.filter(plugin => {
    try {
      return Boolean(requireGatsbyPlugin(plugin, `gatsby-worker`))
    } catch (err) {
      return false
    }
  })
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

  return roots
}

function findSubPlugins(
  plugins: IGatsbyState["flattenedPlugins"],
  allFlattenedPlugins: IGatsbyState["flattenedPlugins"]
): IGatsbyState["flattenedPlugins"] {
  const usedSubPluginNames = new Set<string>(
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
