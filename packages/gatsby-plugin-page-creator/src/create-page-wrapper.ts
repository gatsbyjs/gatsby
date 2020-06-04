import { Actions, CreatePagesArgs } from "gatsby"
import { createPath, validatePath, ignorePath } from "gatsby-page-utils"
import { createClientOnlyPage } from "./create-client-only-page"
import { createPagesFromCollectionBuilder } from "./create-pages-from-collection-builder"
import systemPath from "path"
import fs from "fs-extra"

function pathIsCCollectionBuilder(path: string): boolean {
  if (fs.existsSync(path) === false) return false
  const js = fs.readFileSync(path).toString()
  return js.includes(`createPagesFromData`)
}

function pathIsClientOnlyRoute(path: string): boolean {
  return path.includes(`[`)
}

export function createPage(
  filePath: string,
  pagesDirectory: string,
  actions: Actions,
  ignore: string[],
  graphql: CreatePagesArgs["graphql"]
): void {
  // Filter out special components that shouldn't be made into
  // pages.
  if (!validatePath(filePath)) {
    // console.log(1, filePath)
    return
  }

  // Filter out anything matching the given ignore patterns and options
  if (ignorePath(filePath, ignore)) {
    // console.log(2, filePath)
    return
  }

  const absolutePath = systemPath.join(pagesDirectory, filePath)

  if (pathIsCCollectionBuilder(absolutePath)) {
    // console.log(3, absolutePath)
    createPagesFromCollectionBuilder(filePath, absolutePath, actions, graphql)
    return
  }

  if (pathIsClientOnlyRoute(absolutePath)) {
    // console.log(4, absolutePath)
    createClientOnlyPage(filePath, absolutePath, actions)
    return
  }

  // console.log(5, filePath)

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
