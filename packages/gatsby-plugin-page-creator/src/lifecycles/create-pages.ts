import glob from "globby"
import _ from "lodash"
import systemPath from "path"
import { CreatePagesArgs } from "gatsby"
import { createPath, watchDirectory } from "gatsby-page-utils"
import { createPagesFromCollectionBuilder } from "../collection-routes/create-pages-from-collection-builder"
import { applyIncrementalBuildPatches } from "../collection-routes/apply-incremental-build-patches"
import { trackFeatureIsUsed } from "gatsby-telemetry"
import { IOptions, IPluginState } from "../types"

/* This lifecycle method is solely used for collection routes right now */
export async function createPages(
  {
    store,
    actions,
    graphql,
    reporter,
  }: CreatePagesArgs & {
    traceId: "initial-createPages"
  },
  { path }: IOptions,
  doneCb: Function
): Promise<void> {
  try {
    const { program, status } = store.getState()
    const state = (status.plugins[
      `gatsby-plugin-page-creator`
    ] as any) as IPluginState

    // Incremental builds support
    if (state.isInBootstrap === false) {
      if (path.includes(`node_modules`)) {
        doneCb()
        return
      }
      await applyIncrementalBuildPatches(
        path,
        state.nodes,
        graphql,
        reporter,
        actions
      )
      doneCb()
      return
    }

    const exts = program.extensions.map(e => `${e.slice(1)}`).join(`,`)
    const pagesDirectory = systemPath.resolve(process.cwd(), path)
    const pagesGlob = `**/*.{${exts}}`

    let files = await glob(pagesGlob, { cwd: path })
    await files
      .filter(filePath => filePath.includes(`{`))
      .map(async filePath => {
        store.getState().pages.forEach(page => {
          if (page.component === filePath) {
            actions.deletePage({
              path: createPath(filePath),
              component: filePath,
            })
          }
        })

        trackFeatureIsUsed(`UnifiedRoutes:collection-page-builder`)
        if (!process.env.GATSBY_EXPERIMENTAL_ROUTING_APIS) {
          throw new Error(
            `PageCreator: Found a collection route, but the proper env was not set to enable this experimental feature. Please run again with \`GATSBY_EXPERIMENTAL_ROUTING_APIS=1\` to enable.`
          )
        }
        await createPagesFromCollectionBuilder(
          filePath,
          systemPath.join(pagesDirectory, filePath),
          actions,
          graphql,
          reporter
        )
      })

    watchDirectory(
      path,
      pagesGlob,
      addedPath => {
        if (!_.includes(files, addedPath) && addedPath.includes(`{`) !== true) {
          trackFeatureIsUsed(`UnifiedRoutes:collection-page-builder`)
          if (!process.env.GATSBY_EXPERIMENTAL_ROUTING_APIS) {
            throw new Error(
              `PageCreator: Found a collection route, but the proper env was not set to enable this experimental feature. Please run again with \`GATSBY_EXPERIMENTAL_ROUTING_APIS=1\` to enable.`
            )
          }
          createPagesFromCollectionBuilder(
            addedPath,
            systemPath.join(pagesDirectory, addedPath),
            actions,
            graphql,
            reporter
          )
          files.push(addedPath)
        }
      },
      removedPath => {
        // Delete the page for the now deleted component.
        const componentPath = systemPath.join(pagesDirectory, removedPath)
        store.getState().pages.forEach(page => {
          if (page.component === componentPath) {
            actions.deletePage({
              path: createPath(removedPath),
              component: componentPath,
            })
          }
        })
        files = files.filter(f => f !== removedPath)
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
