import proxy from "express-http-proxy"
import type { RequestHandler } from "express"

export const partytownProxyPath = `/__partytown-proxy`

export function partytownProxy(
  partytownProxiedURLs: Array<string>
): RequestHandler {
  return proxy(req => new URL(req.query.url as string).origin as string, {
    filter: req => partytownProxiedURLs.some(url => req.query?.url === url),
    userResHeaderDecorator(headers, userReq) {
      const origin = new URL(userReq.headers.referer as string).origin as string

      if (origin) {
        headers[`access-control-allow-origin`] = origin
      }

      headers[`referrer-policy`] = `same-origin`

      return headers
    },
    proxyReqPathResolver: req => {
      const { pathname = ``, search = `` } = new URL(req.query?.url as string)
      return pathname + search
    },
  })
}
