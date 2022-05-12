import path from "path"
import { copyLibFiles } from "@builder.io/partytown/utils"
import proxy from "express-http-proxy"
import { CreateDevServerArgs } from "gatsby"

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
  const { partytownProxiedURLs = [] } = config

  for (const host of partytownProxiedURLs) {
    const encodedURL: string = encodeURI(host)

    createRedirect({
      fromPath: `/__partytown-proxy?url=${encodedURL}`,
      toPath: encodedURL,
      statusCode: 200,
    })
  }
}

export async function onCreateDevServer({
  app,
  store,
}: CreateDevServerArgs): Promise<void> {
  const { config } = store.getState()
  const { partytownProxiedURLs = [] } = config || {}

  app.use(
    `/__partytown-proxy`,
    proxy(req => new URL(req.query.url as string).host as string, {
      filter: req => partytownProxiedURLs.some(url => req.query?.url === url),
      proxyReqPathResolver: req => {
        const { pathname = ``, search = `` } = new URL(req.query?.url as string)
        return pathname + search
      },
    })
  )
}
