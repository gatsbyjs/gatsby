import path from "path"
import { copyLibFiles } from "@builder.io/partytown/utils"

/**
 * List of trusted hosts proxied by default. Extracted from Partytown integration tests.
 * @see {@link https://github.com/BuilderIO/partytown/tree/main/tests/integrations}
 */
const proxyHostDefaultSafelist: Array<string> = [
  `assets.adobedtm.com`,
  `connect.facebook.net`,
  `www.google-analytics.com`,
  `www.googletagmanager.com`,
  `forms.hsforms.com`, // HubSpot
  `widget.intercom.io`,
  `syndication.twitter.com`,
  `cdn.syndication.twimg.com`, // Twitter
]

exports.onPreBootstrap = async ({ store }): Promise<void> => {
  const { program } = store.getState()
  await copyLibFiles(path.join(program.directory, `public`, `~partytown`))
}

/**
 * Implement reverse proxy so scripts can fetch in web workers without CORS errors.
 * @see {@link https://partytown.builder.io/proxying-requests}
 */
exports.createPages = ({ actions }): void => {
  const { createRedirect } = actions

  for (const host of proxyHostDefaultSafelist) {
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
