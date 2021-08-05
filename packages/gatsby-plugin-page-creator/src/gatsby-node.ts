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
import { trackFeatureIsUsed } from "gatsby-telemetry"
import { parse, GraphQLString } from "gatsby/graphql"
import {
  createPath,
  watchDirectory,
  IPathIgnoreOptions,
} from "gatsby-page-utils"
import { Options as ISlugifyOptions } from "@sindresorhus/slugify"
import { createPage } from "./create-page-wrapper"
import { collectionExtractQueryString } from "./collection-extract-query-string"
import { derivePath } from "./derive-path"
import { validatePathQuery } from "./validate-path-query"
import { CODES, ERROR_MAP, prefixId } from "./error-utils"

interface IOptions extends PluginOptions {
  path: string
  pathCheck?: boolean
  ignore?: IPathIgnoreOptions | string | Array<string> | null
  slugify?: ISlugifyOptions
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
  {
    path: pagesPath,
    pathCheck = true,
    ignore,
    slugify: slugifyOptions,
  }: IOptions,
  doneCb: PluginCallback
): Promise<void> {
  try {
    const { deletePage } = actions
    const { program } = store.getState()

    const exts = program.extensions.map(e => `${e.slice(1)}`).join(`,`)

    if (!pagesPath) {
      reporter.panic({
        id: prefixId(CODES.RequiredPath),
        context: {
          sourceMessage: `"path" is a required option for gatsby-plugin-page-creator

See docs here - https://www.gatsbyjs.org/plugins/gatsby-plugin-page-creator/`,
        },
      })
    }

    // Validate that the path exists.
    if (pathCheck && !existsSync(pagesPath)) {
      reporter.panic({
        id: prefixId(CODES.NonExistingPath),
        context: {
          sourceMessage: `The path passed to gatsby-plugin-page-creator does not exist on your file system:

${pagesPath}

Please pick a path to an existing directory.`,
        },
      })
    }

    const pagesDirectory = systemPath.resolve(process.cwd(), pagesPath)
    const pagesGlob = `**/*.{${exts}}`

    // Get initial list of files.
    const files = await glob(pagesGlob, { cwd: pagesPath })
    files.forEach(file => {
      createPage(
        file,
        pagesDirectory,
        actions,
        graphql,
        reporter,
        ignore,
        slugifyOptions
      )
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
              graphql,
              reporter,
              ignore,
              slugifyOptions
            )
            knownFiles.add(addedPath)
          }
        } catch (e) {
          reporter.panic({
            id: prefixId(CODES.FileSystemAdd),
            context: {
              sourceMessage: e.message,
            },
          })
        }
      },
      removedPath => {
        // Delete the page for the now deleted component.
        try {
          const componentPath = systemPath.join(pagesDirectory, removedPath)
          store.getState().pages.forEach(page => {
            if (page.component === componentPath) {
              deletePage({
                path: page.path,
                component: componentPath,
              })
            }
          })
          knownFiles.delete(removedPath)
        } catch (e) {
          reporter.panic({
            id: prefixId(CODES.FileSystemRemove),
            context: {
              sourceMessage: e.message,
            },
          })
        }
      }
    ).then(() => doneCb(null, null))
  } catch (e) {
    reporter.panicOnBuild({
      id: prefixId(CODES.Generic),
      context: {
        sourceMessage: e.message,
      },
    })
  }
}

export function setFieldsOnGraphQLNodeType(
  { getNode, type, store, reporter }: SetFieldsOnGraphQLNodeTypeArgs,
  { slugify: slugifyOptions }: PluginOptions & { slugify: ISlugifyOptions }
): Record<string, unknown> {
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
            source: Record<string, unknown>,
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
            const { derivedPath } = derivePath(
              filePath,
              sourceCopy,
              reporter,
              slugifyOptions
            )

            return createPath(derivedPath)
          },
        },
      }
    }

    return {}
  } catch (e) {
    reporter.panicOnBuild({
      id: prefixId(CODES.GraphQLResolver),
      context: {
        sourceMessage: e.message,
      },
    })
    return {}
  }
}

export async function onPreInit(
  { reporter }: ParentSpanPluginArgs,
  { path: pagesPath }: IOptions
): Promise<void> {
  if (reporter.setErrorMap) {
    reporter.setErrorMap(ERROR_MAP)
  }

  try {
    const pagesGlob = `**/**\\{*\\}**`

    const files = await glob(pagesGlob, { cwd: pagesPath })

    if (files.length > 0) {
      trackFeatureIsUsed(`UnifiedRoutes:collection-page-builder`)
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
    reporter.panicOnBuild({
      id: prefixId(CODES.Generic),
      context: {
        sourceMessage: e.message,
      },
    })
  }
}
