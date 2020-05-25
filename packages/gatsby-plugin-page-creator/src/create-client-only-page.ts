import { Actions } from "gatsby"
import { createPath } from "gatsby-page-utils"

// Changes something like
//   `/Users/site/src/pages/foo/[id]/`
// to
//   `/foo/:id`
function translateInterpolationToMatchPath(createdPath: string): string {
  const [, path] = createdPath.split(`src/pages`)
  return path.replace(`[`, `:`).replace(`]`, ``).replace(/\/$/, ``)
}

export function createClientOnlyPage(absolutePath: string, actions: Actions) {
  // Create page object
  const createdPath = createPath(absolutePath)
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
