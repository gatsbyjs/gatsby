import { Actions } from "gatsby"
import path from "path"
import fs from "fs-extra"
import reporter from "gatsby-cli/lib/reporter"
import chokidar from "chokidar"

interface IRedirect {
  fromPath: string
  isPermanent?: boolean
  toPath: string
  redirectInBrowser?: boolean
  force?: boolean
  statusCode?: number
  [key: string]: unknown
}

let previousRedirectsRun: IRedirect[] = []

export async function handleRedirectsFromJSONFile(
  pagesDirectory: string,
  actions: Actions
): Promise<void> {
  const absolutePath = path.join(pagesDirectory, `..`, `redirects.json`)

  // 1. Only execute this logic if the user has a redirects.json
  if ((await fs.pathExists(absolutePath)) === false) return

  // 2. Ensure they are using the experimental flag
  if (!process.env.GATSBY_EXPERIMENTAL_ROUTING_APIS) {
    throw new Error(
      `PageCreator: Found a collection route, but the proper env was not set to enable this experimental feature. Please run again with \`GATSBY_EXPERIMENTAL_ROUTING_APIS=1\` to enable.`
    )
  }

  // 3. Get the redirects
  const redirects = await getRedirects(absolutePath)

  previousRedirectsRun = redirects

  reporter.info(
    `   Creating ${redirects.length} redirect${
      redirects.length === 1 ? `` : `s`
    } from src/redirect.json`
  )

  // 4. Loop through each node and create a redirect from it
  redirects.forEach(redirect => {
    actions.createRedirect(redirect)
  })

  watchFileForChanges(absolutePath, actions)
}

function watchFileForChanges(absolutePath: string, actions: Actions): void {
  chokidar.watch(absolutePath).on(`change`, async () => {
    previousRedirectsRun.forEach(redirect => {
      // @ts-ignore unlisted action
      actions.deleteRedirect(redirect)
    })

    const redirects = await getRedirects(absolutePath)

    previousRedirectsRun = redirects

    reporter.info(
      `   Creating ${redirects.length} redirect${
        redirects.length === 1 ? `` : `s`
      } from src/redirect.json`
    )

    // 4. Loop through each node and create a redirect from it
    redirects.forEach(redirect => {
      actions.createRedirect(redirect)
    })
  })
}

async function getRedirects(absolutePath: string): Promise<Array<IRedirect>> {
  // 3. Load the file and convert to string
  const json = (await fs.readFile(absolutePath)).toString()

  try {
    // 4. Parse the JSON
    const redirects = JSON.parse(json)

    if (Array.isArray(redirects) === false) throw new Error()

    return redirects
  } catch (e) {
    throw new Error(
      `An error occurred parsing the json from src/redirects.json, make sure the JSON is valid syntax and it is an array of redirect objects`
    )
  }
}
