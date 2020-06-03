import { Actions } from "gatsby"
import { createPath } from "gatsby-page-utils"

// Changes something like
//   `/foo/[id]/`
// to
//   `/foo/:id`
function translateInterpolationToMatchPath(createdPath: string): string {
  return createdPath
    .replace(`[...`, `*`)
    .replace(`[`, `:`)
    .replace(`]`, ``)
    .replace(/\/$/, ``)
}

export function createClientOnlyPage(
  filePath: string,
  absolutePath: string,
  actions: Actions
): void {
  // Create page object
  const createdPath = createPath(filePath)
  const matchPath = translateInterpolationToMatchPath(createdPath)

  const page = {
    path: createdPath,
    matchPath: matchPath,
    component: absolutePath,
    context: {},
  }

  // Add page
  actions.createPage(page)
}
