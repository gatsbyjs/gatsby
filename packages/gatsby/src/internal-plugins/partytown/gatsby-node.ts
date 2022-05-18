import path from "path"
import { copyLibFiles } from "@builder.io/partytown/utils"
import { CreateDevServerArgs } from "gatsby"
import { partytownProxyPath, partytownProxy } from "./proxy"
import reporter from "gatsby-cli/lib/reporter"

/**
 * Copy Partytown library files to public.
 * @see {@link https://partytown.builder.io/copy-library-files}
 */
exports.onPreBootstrap = async ({ store }): Promise<void> => {
  const { program } = store.getState()
  await copyLibFiles(path.join(program.directory, `public`, `~partytown`))
}

/**
 * Implement reverse proxy so scripts can fetch in web workers without CORS errors.
 * @see {@link https://partytown.builder.io/proxying-requests}
 */
exports.createPages = ({ actions, store }): void => {
  const { createRedirect } = actions

  const { config = {} } = store.getState()
  const { partytownProxiedURLs = [], siteMetadata = {} } = config

  for (const host of partytownProxiedURLs) {
    const encodedURL: string = encodeURI(host)

    const headers: Array<string> = [`Referrer-Policy: same-origin`]

    if (siteMetadata?.siteUrl) {
      headers.push(`Access-Control-Allow-Origin: ${siteMetadata?.siteUrl}`)
    } else {
      reporter.warn(
        `No siteMetadata.siteUrl found in gatsby-config.\nAdd one to ensure the Partytown proxy for your off-main-thread scripts are restricted to your site URL with CORS.\nSee https://gatsby.dev/gatsby-script for more information.`
      )
    }

    createRedirect({
      fromPath: `${partytownProxyPath}?url=${encodedURL}`,
      toPath: encodedURL,
      statusCode: 200,
      headers: {
        [partytownProxyPath]: headers,
      },
    })
  }
}

export async function onCreateDevServer({
  app,
  store,
}: CreateDevServerArgs): Promise<void> {
  const { config } = store.getState()
  const { partytownProxiedURLs = [] } = config || {}

  app.use(partytownProxyPath, partytownProxy(partytownProxiedURLs))
}
