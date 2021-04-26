import { Actions, CreatePagesArgs } from "gatsby"
import {
  createPath,
  validatePath,
  ignorePath,
  IPathIgnoreOptions,
} from "gatsby-page-utils"
import { Options as ISlugifyOptions } from "@sindresorhus/slugify"
import { createClientOnlyPage } from "./create-client-only-page"
import { createPagesFromCollectionBuilder } from "./create-pages-from-collection-builder"
import systemPath from "path"
import { trackFeatureIsUsed } from "gatsby-telemetry"
import { Reporter } from "gatsby/reporter"

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
  graphql: CreatePagesArgs["graphql"],
  reporter: Reporter,
  ignore?: IPathIgnoreOptions | string | Array<string> | null,
  slugifyOptions?: ISlugifyOptions
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
    createPagesFromCollectionBuilder(
      filePath,
      absolutePath,
      actions,
      graphql,
      reporter,
      slugifyOptions
    )
    return
  }

  // If the path includes a `[]` in it, then we create it as a client only route
  if (pathIsClientOnlyRoute(absolutePath)) {
    trackFeatureIsUsed(`UnifiedRoutes:client-page-builder`)
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
