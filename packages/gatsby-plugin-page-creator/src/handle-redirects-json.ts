import { Actions } from "gatsby"
import path from "path"
import fs from "fs-extra"
import reporter from "gatsby-cli/lib/reporter"

export async function handleRedirectsFromJSONFile(
  pagesDirectory: string,
  actions: Actions
) {
  const absolutePath = path.join(pagesDirectory, "..", "redirects.json")

  // 1. Only execute this logic if the user has a redirects.json
  if ((await fs.pathExists(absolutePath)) === false) return

  // 2. Ensure they are using the experimental flag
  if (!process.env.GATSBY_EXPERIMENTAL_ROUTING_APIS) {
    throw new Error(
      `PageCreator: Found a collection route, but the proper env was not set to enable this experimental feature. Please run again with \`GATSBY_EXPERIMENTAL_ROUTING_APIS=1\` to enable.`
    )
  }

  // 3. Load the file and convert to string
  const json = (await fs.readFile(absolutePath)).toString()

  try {
    // 4. Parse the JSON
    const redirects = JSON.parse(json)
    reporter.info(
      `   Creating ${redirects.length} redirect${
        redirects.length === 1 ? `` : `s`
      } from src/redirect.json`
    )

    // 5. Loop through each node and create a redirect from it
    redirects.forEach(redirect => {
      actions.createRedirect(redirect)
    })
  } catch (e) {
    throw new Error(
      `An error occurred parsing the json from src/redirects.json, make sure the JSON is valid syntax and it is an array of redirect objects`
    )
  }
}
