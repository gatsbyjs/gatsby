import { Actions, CreatePagesArgs } from "gatsby"
import { createPath, validatePath, ignorePath } from "gatsby-page-utils"
import { createClientOnlyPage } from "./create-client-only-page"
import { createPagesFromCollectionBuilder } from "./create-pages-from-collection-builder"
import systemPath from "path"
import { trackFeatureIsUsed } from "gatsby-telemetry"
import { Reporter } from "gatsby"

function pathIsCollectionBuilder(path: string): boolean {
  return path.includes(`{`)
}

function pathIsClientOnlyRoute(path: string): boolean {
  return path.includes(`[`)
}

export function createPage(
  filePath: string,
  pagesDirectory: string,
  actions: Actions,
  ignore: string[],
  graphql: CreatePagesArgs["graphql"],
  reporter: Reporter
): void {
  // Filter out special components that shouldn't be made into
  // pages.
  if (!validatePath(filePath)) {
    return
  }

  // Filter out anything matching the given ignore patterns and options
  if (ignorePath(filePath, ignore)) {
    return
  }

  const absolutePath = systemPath.join(pagesDirectory, filePath)

  // If the page includes a `{}` in it, then we create it as a collection builder
  if (pathIsCollectionBuilder(absolutePath)) {
    trackFeatureIsUsed(`UnifiedRoutes:collection-page-builder`)
    if (!process.env.GATSBY_EXPERIMENTAL_ROUTING_APIS) {
      throw new Error(
        `PageCreator: Found a collection route, but the proper env was not set to enable this experimental feature. Please run again with \`GATSBY_EXPERIMENTAL_ROUTING_APIS=1\` to enable.`
      )
    }
    createPagesFromCollectionBuilder(
      filePath,
      absolutePath,
      actions,
      graphql,
      reporter
    )
    return
  }

  // If the path includes a `[]` in it, then we create it as a client only route
  if (pathIsClientOnlyRoute(absolutePath)) {
    trackFeatureIsUsed(`UnifiedRoutes:client-page-builder`)
    if (!process.env.GATSBY_EXPERIMENTAL_ROUTING_APIS) {
      throw new Error(`PageCreator: Found a client route, but the proper env was not set to enable this experimental feature. Please run again with \`GATSBY_EXPERIMENTAL_ROUTING_APIS=1\` to enable.
Skipping creating pages for ${absolutePath}`)
    }
    createClientOnlyPage(filePath, absolutePath, actions)
    return
  }

  // Create page object
  const createdPath = createPath(filePath)
  const page = {
    path: createdPath,
    component: absolutePath,
    context: {},
  }

  // Add page
  actions.createPage(page)
}
