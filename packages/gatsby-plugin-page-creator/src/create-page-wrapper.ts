import { Actions, CreatePagesArgs } from "gatsby"
import {
  createPath,
  validatePath,
  ignorePath,
  IPathIgnoreOptions,
  applyTrailingSlashOption,
} from "gatsby-page-utils"
import { Options as ISlugifyOptions } from "@sindresorhus/slugify"
import { createClientOnlyPage } from "./create-client-only-page"
import { createPagesFromCollectionBuilder } from "./create-pages-from-collection-builder"
import systemPath from "path"
import { Reporter } from "gatsby/reporter"
import type { TrailingSlash } from "gatsby-page-utils"

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
  trailingSlash: TrailingSlash,
  pagesPath: string,
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
    createPagesFromCollectionBuilder({
      filePath,
      absolutePath,
      pagesPath,
      actions,
      graphql,
      reporter,
      trailingSlash,
      slugifyOptions,
    })
    return
  }

  // If the path includes a `[]` in it, then we create it as a client only route
  if (pathIsClientOnlyRoute(absolutePath)) {
    createClientOnlyPage(filePath, absolutePath, actions, trailingSlash)
    return
  }

  // Create page object
  const createdPath = createPath(filePath)
  const modifiedPath = applyTrailingSlashOption(createdPath, trailingSlash)
  const page = {
    path: modifiedPath,
    component: absolutePath,
    context: {},
  }

  // Add page
  actions.createPage(page)
}
