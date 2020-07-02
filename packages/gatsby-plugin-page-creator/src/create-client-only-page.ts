import { Actions } from "gatsby"
import { createPath } from "gatsby-page-utils"
import { getMatchPath } from "./get-match-path"
import { handleUnstable } from "./handle-unstable"

// Create a client side page with a matchPath
// based on the `[]` existing in it's file path.
// e.g., a file named `src/pages/foo/[bar].js`
// gets created at the url: `foo/:bar`
export function createClientOnlyPage(
  filePath: string,
  absolutePath: string,
  actions: Actions
): void {
  validateUnstableUsage(filePath)

  const path = createPath(handleUnstable(filePath))

  actions.createPage({
    path,
    ...getMatchPath(path),
    component: absolutePath,
    context: {},
  })
}

function validateUnstableUsage(filePath: string): void {
  let shouldThrow = false
  const pagesPath = filePath.split(`src/pages`)[0]

  filePath.split(`/`).forEach(part => {
    if (part.startsWith(`[`) && part.startsWith(`[unstable_`) === false) {
      shouldThrow = true
    }
  })

  if (shouldThrow) {
    console.error(`Creating client side routes in gatsby with the filesystem is an experimental feature. We require files to use the prefix 'unstable_' in each segment.

Your current path:
src/pages/${pagesPath}

Change it to this:
src/pages/${pagesPath.replace(/\[/g, `[unstable_`)}`)
    process.exit(1)
  }
}
