import path from "path"
import { copyLibFiles } from "@builder.io/partytown/utils"
import { CreateDevServerArgs } from "gatsby"
import { partytownProxyPath, partytownProxy } from "./proxy"

/**
 * Copy Partytown library files to public.
 * @see {@link https://partytown.builder.io/copy-library-files}
 */
exports.onPreBootstrap = async ({ store }): Promise<void> => {
  const { program, config } = store.getState()
  const lib = config?.partytown?.lib || `/~partytown/`
  await copyLibFiles(path.join(program.directory, `public`, lib))
}

/**
 * Implement reverse proxy so scripts can fetch in web workers without CORS errors.
 * @see {@link https://partytown.builder.io/proxying-requests}
 */
exports.createPages = ({ actions, store }): void => {
  const { createRedirect } = actions

  const { config = {} } = store.getState()

  for (const proxiedURL of config?.partytown?.proxiedURLs || []) {
    const encodedURL: string = encodeURI(proxiedURL)

    createRedirect({
      fromPath: `${partytownProxyPath}?url=${encodedURL}`,
      toPath: encodedURL,
      statusCode: 200,
    })
  }
}

export async function onCreateDevServer({
  app,
  store,
}: CreateDevServerArgs): Promise<void> {
  const { config = {} } = store.getState()

  app.use(
    partytownProxyPath,
    partytownProxy(config?.partytown?.proxiedURLs || [])
  )
}
