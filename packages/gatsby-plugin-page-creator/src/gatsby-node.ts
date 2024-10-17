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
import { parse, GraphQLString } from "gatsby/graphql"
import {
  createPath,
  watchDirectory,
  applyTrailingSlashOption,
} from "gatsby-page-utils"
import { Options as ISlugifyOptions } from "@sindresorhus/slugify"
import { createPage } from "./create-page-wrapper"
import { collectionExtractQueryString } from "./collection-extract-query-string"
import { derivePath } from "./derive-path"
import { validatePathQuery } from "./validate-path-query"
import { CODES, ERROR_MAP, prefixId } from "./error-utils"
import { createPagesFromChangedNodes } from "./create-pages-from-changed-nodes"
import type { IOptions } from "./types"
import {
  getPluginInstance,
  ICreateAPageFromNodeArgs,
} from "./tracked-nodes-state"
import { findCollectionPageFiles } from "./path-utils"
import { getCollectionRouteParams } from "./get-collection-route-params"
import { reverseLookupParams } from "./extract-query"
import { getMatchPath } from "gatsby-core-utils/match-path"

const knownCollections = new Map()

export function createPages(_: CreatePagesArgs, pluginOptions: IOptions): void {
  const instance = getPluginInstance(pluginOptions)
  if (instance.syncPages) {
    instance.syncPages()
  }
}

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
    emitter,
  }: CreatePagesArgs & {
    traceId: "initial-createPages"
  },
  pluginOptions: IOptions,
  doneCb: PluginCallback
): Promise<void> {
  const {
    path: pagesPath,
    pathCheck = true,
    ignore,
    slugify: slugifyOptions,
  } = pluginOptions
  try {
    const { deletePage } = actions
    const { program, config } = store.getState()
    const { trailingSlash = `always` } = config

    const exts = program.extensions.map(e => `${e.slice(1)}`).join(`,`)

    if (!pagesPath) {
      reporter.panic({
        id: prefixId(CODES.RequiredPath),
        context: {
          sourceMessage: `"path" is a required option for gatsby-plugin-page-creator

See docs here - https://www.gatsbyjs.com/plugins/gatsby-plugin-page-creator/`,
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
        trailingSlash,
        pagesPath,
        ignore,
        slugifyOptions
      )
    })

    const knownFiles = new Set(files)
    const pluginInstance = getPluginInstance({ path: pagesPath })

    pluginInstance.syncPages = function syncPages(): void {
      createPagesFromChangedNodes({ actions, pluginInstance }, pluginOptions)
    }

    pluginInstance.resolveFields = async function resolveFields(
      nodeIds: Array<string>,
      absolutePath: string
    ): Promise<Array<Record<string, Record<string, unknown>>>> {
      const queryString = collectionExtractQueryString(
        absolutePath,
        reporter,
        nodeIds
      )
      if (!queryString) {
        return []
      }

      const { data } = await graphql<{
        nodes: Record<string, unknown>
      }>(queryString)

      if (!data) {
        return []
      }

      const nodes = Object.values(Object.values(data)[0])[0] as any as Array<
        Record<string, Record<string, unknown>>
      >
      return nodes
    }

    pluginInstance.getPathFromAResolvedNode =
      async function getPathFromAResolvedNode({
        node,
        absolutePath,
      }: ICreateAPageFromNodeArgs): Promise<string> {
        const filePath = systemPath.relative(pluginOptions.path, absolutePath)

        // URL path for the component and node
        const { derivedPath } = await derivePath(
          filePath,
          node,
          reporter,
          slugifyOptions
        )

        const hasTrailingSlash = derivedPath.endsWith(`/`)
        const path = createPath(derivedPath, hasTrailingSlash, true)
        const modifiedPath = applyTrailingSlashOption(path, trailingSlash)
        return modifiedPath
      }

    pluginInstance.createAPageFromNode = async function createAPageFromNode({
      node,
      absolutePath,
    }: ICreateAPageFromNodeArgs): Promise<
      undefined | { errors: number; path: string }
    > {
      const filePath = systemPath.relative(pluginOptions.path, absolutePath)

      const contentFilePath = node.internal?.contentFilePath
      // URL path for the component and node
      const { derivedPath, errors } = await derivePath(
        filePath,
        node,
        reporter,
        slugifyOptions
      )

      const hasTrailingSlash = derivedPath.endsWith(`/`)
      const path = createPath(derivedPath, hasTrailingSlash, true)
      const modifiedPath = applyTrailingSlashOption(path, trailingSlash)

      // We've already created a page with this path
      if (this.knownPagePaths.has(modifiedPath)) {
        return undefined
      }
      this.knownPagePaths.add(modifiedPath)
      // Params is supplied to the FE component on props.params
      const params = getCollectionRouteParams(createPath(filePath), path)
      // nodeParams is fed to the graphql query for the component
      const nodeParams = reverseLookupParams(node, absolutePath)
      // matchPath is an optional value. It's used if someone does a path like `{foo}/[bar].js`
      const matchPath = getMatchPath(path)

      const componentPath = contentFilePath
        ? `${absolutePath}?__contentFilePath=${contentFilePath}`
        : absolutePath

      actions.createPage({
        path: modifiedPath,
        matchPath,
        component: componentPath,
        context: {
          ...nodeParams,
          __params: params,
        },
      })

      const nodeId = node.id as unknown as string
      if (nodeId) {
        let templatesToPagePath = this.nodeIdToPagePath.get(nodeId)
        if (!templatesToPagePath) {
          templatesToPagePath = new Map<string, string>()
          this.nodeIdToPagePath.set(nodeId, templatesToPagePath)
        }

        templatesToPagePath.set(componentPath, modifiedPath)
      }

      return { errors, path }
    }

    pluginInstance.deletePagesCreateFromNode =
      function deletePagesCreateFromNode(id: string): void {
        const templatesToPagePaths = this.nodeIdToPagePath.get(id)
        if (templatesToPagePaths) {
          for (const [
            componentPath,
            pagePath,
          ] of templatesToPagePaths.entries()) {
            actions.deletePage({
              path: pagePath,
              component: componentPath,
            })
            this.knownPagePaths.delete(pagePath)
          }
          this.nodeIdToPagePath.delete(id)
        }
      }

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
              trailingSlash,
              pagesPath,
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

          pluginInstance.templateFileRemoved(componentPath)
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

    emitter.on(`DELETE_NODE`, action => {
      if (action.payload?.id) {
        if (pluginInstance.trackedTypes.has(action.payload?.internal?.type)) {
          pluginInstance.changedNodesSinceLastPageCreation.deleted.set(
            action.payload.id,
            {
              id: action.payload.id,
              contentDigest: action.payload.internal.contentDigest,
            }
          )
        }
      }
    })

    emitter.on(`CREATE_NODE`, action => {
      if (pluginInstance.trackedTypes.has(action.payload?.internal?.type)) {
        // If this node was deleted before being recreated, remove it from the deleted node list
        pluginInstance.changedNodesSinceLastPageCreation.deleted.delete(
          action.payload.id
        )

        pluginInstance.changedNodesSinceLastPageCreation.created.set(
          action.payload.id,
          {
            id: action.payload.id,
            contentDigest: action.payload.internal.contentDigest,
            type: action.payload.internal.type,
          }
        )
      }
    })
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
    const { trailingSlash = `always` } = store.getState().config
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
          resolve: async (
            source: Record<string, unknown>,
            { filePath }: { filePath: string },
            context
          ): Promise<string> => {
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

            const getFieldValue = context.nodeModel.getFieldValue

            validatePathQuery(filePath, extensions)
            const { derivedPath } = await derivePath(
              filePath,
              sourceCopy,
              reporter,
              slugifyOptions,
              getFieldValue
            )

            const hasTrailingSlash = derivedPath.endsWith(`/`)
            const path = createPath(derivedPath, hasTrailingSlash, true)
            const modifiedPath = applyTrailingSlashOption(path, trailingSlash)

            return modifiedPath
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

export async function onPluginInit(
  { reporter }: ParentSpanPluginArgs,
  { path: pagesPath }: IOptions
): Promise<void> {
  if (reporter.setErrorMap) {
    reporter.setErrorMap(ERROR_MAP)
  }

  try {
    const files = await findCollectionPageFiles(pagesPath)

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
