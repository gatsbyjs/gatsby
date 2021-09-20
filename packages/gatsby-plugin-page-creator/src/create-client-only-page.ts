import { Actions } from "gatsby"
import { createPath } from "gatsby-page-utils"
import { getMatchPath } from "gatsby-core-utils"

// Create a client side page with a matchPath
// based on the `[]` existing in it's file path.
// e.g., a file named `src/pages/foo/[bar].js`
// gets created at the url: `foo/:bar`
export function createClientOnlyPage(
  filePath: string,
  absolutePath: string,
  actions: Actions
): void {
  const path = createPath(filePath)

  actions.createPage({
    path,
    matchPath: getMatchPath(path),
    component: absolutePath,
    context: {},
  })
}
