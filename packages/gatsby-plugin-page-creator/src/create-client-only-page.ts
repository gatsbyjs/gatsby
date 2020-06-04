import { Actions } from "gatsby"
import { createPath } from "gatsby-page-utils"
import { getMatchPath } from "./get-match-path"

export function createClientOnlyPage(
  filePath: string,
  absolutePath: string,
  actions: Actions
): void {
  // Create page object
  const createdPath = createPath(filePath)

  const page = {
    path: createdPath,
    ...getMatchPath(createdPath),
    component: absolutePath,
    context: {},
  }

  // Add page
  actions.createPage(page)
}
