import reporter from "gatsby-cli/lib/reporter"
import proxy from "express-http-proxy"
import type { RequestHandler } from "express"

export const thirdPartyProxyPath = `/__third-party-proxy`

export function partytownProxy(
  partytownProxiedURLs: Array<string>,
  protocol: string
): RequestHandler {
  return proxy(req => new URL(req.query.url as string).origin as string, {
    filter: req => {
      const allowListed = partytownProxiedURLs.some(
        url => req.query?.url === url
      )

      if (!allowListed) {
        const currentAllowList = partytownProxiedURLs.join(`\n`)
        const currentAllowListMessage = currentAllowList
          ? `\n\nCurrent allowlist entries:\n${currentAllowList}`
          : ``

        const docsUrl = `https://gatsby.dev/partytown-proxied-urls`
        const seeDocsMessage = `See ${docsUrl} for more information.`

        reporter.warn(
          `The script URL "${req.query?.url}" did not match the partytownProxiedURLs allowlist in your gatsby-config file. URLs must match absolutely when using the off-main-thread strategy. ${currentAllowListMessage}\n\n${seeDocsMessage}`
        )
      }

      const { protocol: proxiedRequestProtocol, hostname } = new URL(
        req.query?.url as string
      )

      if (hostname === `localhost` && protocol !== proxiedRequestProtocol) {
        reporter.warn(
          `The script URL "${req.query?.url}" does not match the protocol of "${protocol}${hostname}". URLs must match absolutely when using the off-main-thread strategy.`
        )
      }

      return allowListed
    },
    proxyReqPathResolver: req => {
      const { pathname = ``, search = `` } = new URL(req.query?.url as string)
      return pathname + search
    },
  })
}
