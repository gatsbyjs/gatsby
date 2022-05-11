import path from "path"
import { copyLibFiles } from "@builder.io/partytown/utils"
import { partytownDefaultProxiedHosts } from "./default-proxied-hosts"

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
  const { partytownProxiedHosts = [] } = config
  const hosts = [...partytownDefaultProxiedHosts, ...partytownProxiedHosts]

  for (const host of hosts) {
    const encodedURL: string = encodeURI(`https://${host}`)

    createRedirect({
      fromPath: `/__partytown-proxy?url=${encodedURL}`,
      toPath: encodedURL,
      statusCode: 200,
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "/__partytown-proxy": [`Access-Control-Allow-Origin: *`],
      },
    })
  }
}
