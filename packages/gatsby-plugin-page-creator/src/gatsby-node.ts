import _ from "lodash"
import glob from "globby"
import systemPath from "path"
import { sync as existsSync } from "fs-exists-cached"
import {
  CreatePagesArgs,
  ParentSpanPluginArgs,
  SetFieldsOnGraphQLNodeTypeArgs,
  PluginOptions,
  PluginCallback,
} from "gatsby"
import { createPage } from "./create-page-wrapper"
import { createPath, watchDirectory } from "gatsby-page-utils"
import { collectionExtractQueryString } from "./collection-extract-query-string"
import { parse, GraphQLString } from "graphql"
import { derivePath } from "./derive-path"
import { validatePathQuery } from "./validate-path-query"
import { trackFeatureIsUsed } from "gatsby-telemetry"

interface IOptions extends PluginOptions {
  path: string
  pathCheck: boolean
  ignore: Array<string>
}

const knownCollections = new Map()

// Path creator.
// Auto-create pages.
// algorithm is glob /pages directory for js/jsx/cjsx files *not*
// underscored. Then create url w/ our path algorithm *unless* user
// takes control of that page component in gatsby-node.
export async function createPagesStatefully(
  {
    store,
    actions,
    reporter,
    graphql,
  }: CreatePagesArgs & {
    traceId: "initial-createPages"
  },
  { path: pagesPath, pathCheck = true, ignore }: IOptions,
  doneCb: PluginCallback
): Promise<void> {
  try {
    const { deletePage } = actions
    const { program } = store.getState()

    const exts = program.extensions.map(e => `${e.slice(1)}`).join(`,`)

    if (!pagesPath) {
      reporter.panic(`"path" is a required option for gatsby-plugin-page-creator

See docs here - https://www.gatsbyjs.org/plugins/gatsby-plugin-page-creator/`)
    }

    // Validate that the path exists.
    if (pathCheck && !existsSync(pagesPath)) {
      reporter.panic(`The path passed to gatsby-plugin-page-creator does not exist on your file system:

${pagesPath}

Please pick a path to an existing directory.`)
    }

    const pagesDirectory = systemPath.resolve(process.cwd(), pagesPath)
    const pagesGlob = `**/*.{${exts}}`

    // Get initial list of files.
    const files = await glob(pagesGlob, { cwd: pagesPath })
    files.forEach(file => {
      createPage(file, pagesDirectory, actions, ignore, graphql, reporter)
    })

    const knownFiles = new Set(files)

    watchDirectory(
      pagesPath,
      pagesGlob,
      addedPath => {
        try {
          if (!knownFiles.has(addedPath)) {
            createPage(
              addedPath,
              pagesDirectory,
              actions,
              ignore,
              graphql,
              reporter
            )
            knownFiles.add(addedPath)
          }
        } catch (e) {
          reporter.panic(
            e.message.startsWith(`PageCreator`)
              ? e.message
              : `PageCreator: ${e.message}`
          )
        }
      },
      removedPath => {
        // Delete the page for the now deleted component.
        try {
          const componentPath = systemPath.join(pagesDirectory, removedPath)
          store.getState().pages.forEach(page => {
            if (page.component === componentPath) {
              deletePage({
                path: createPath(removedPath),
                component: componentPath,
              })
            }
          })
          knownFiles.delete(removedPath)
        } catch (e) {
          reporter.panic(
            e.message.startsWith(`PageCreator`)
              ? e.message
              : `PageCreator: ${e.message}`
          )
        }
      }
    ).then(() => doneCb(null, null))
  } catch (e) {
    reporter.panic(
      e.message.startsWith(`PageCreator`)
        ? e.message
        : `PageCreator: ${e.message}`
    )
  }
}

export function setFieldsOnGraphQLNodeType({
  getNode,
  type,
  store,
  reporter,
}: SetFieldsOnGraphQLNodeTypeArgs): object {
  try {
    const extensions = store.getState().program.extensions
    const collectionQuery = _.camelCase(`all ${type.name}`)
    if (knownCollections.has(collectionQuery)) {
      return {
        gatsbyPath: {
          type: GraphQLString,
          args: {
            filePath: {
              type: GraphQLString,
            },
          },
          resolve: (
            source: object,
            { filePath }: { filePath: string }
          ): string => {
            // This is a quick hack for attaching parents to the node.
            // This may be an incomprehensive fixed for the general use case
            // of connecting nodes together. However, I don't quite know how to
            // fully understand the use-cases. So this is a simple fix for this
            // one common-use, and we'll iterate as we understand.
            const sourceCopy = { ...source }
            // @ts-ignore
            if (typeof source.parent === `string`) {
              // @ts-ignore
              sourceCopy.parent = getNode(source.parent)
            }

            validatePathQuery(filePath, extensions)

            return derivePath(filePath, sourceCopy, reporter)
          },
        },
      }
    }

    return {}
  } catch (e) {
    reporter.panic(
      e.message.startsWith(`PageCreator`)
        ? e.message
        : `PageCreator: ${e.message}`
    )
    return {}
  }
}

export async function onPreInit(
  { reporter }: ParentSpanPluginArgs,
  { path: pagesPath }: IOptions
): Promise<void> {
  try {
    const pagesGlob = `**/\\{*\\}**`

    const files = await glob(pagesGlob, { cwd: pagesPath })

    if (files.length > 0) {
      trackFeatureIsUsed(`UnifiedRoutes:collection-page-builder`)
      if (!process.env.GATSBY_EXPERIMENTAL_ROUTING_APIS) {
        reporter.panic(
          `PageCreator: Found a collection route, but the proper env was not set to enable this experimental feature. Please run again with \`GATSBY_EXPERIMENTAL_ROUTING_APIS=1\` to enable.`
        )
      }
    }

    await Promise.all(
      files.map(async relativePath => {
        const absolutePath = require.resolve(
          systemPath.join(pagesPath, relativePath)
        )
        const queryString = await collectionExtractQueryString(
          absolutePath,
          reporter
        )
        if (!queryString) return
        const ast = parse(queryString)
        knownCollections.set(
          // @ts-ignore
          ast.definitions[0].selectionSet.selections[0].name.value,
          relativePath
        )
      })
    )
  } catch (e) {
    reporter.panic(
      e.message.startsWith(`PageCreator`)
        ? e.message
        : `PageCreator: ${e.message}`
    )
  }
}
