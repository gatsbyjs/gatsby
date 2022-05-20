import proxy from "express-http-proxy"
import type { RequestHandler } from "express"

export const thirdPartyProxyPath = `/__third-party-proxy`

export function partytownProxy(
  partytownProxiedURLs: Array<string>
): RequestHandler {
  return proxy(req => new URL(req.query.url as string).origin as string, {
    filter: req => partytownProxiedURLs.some(url => req.query?.url === url),
    proxyReqPathResolver: req => {
      const { pathname = ``, search = `` } = new URL(req.query?.url as string)
      return pathname + search
    },
  })
}
