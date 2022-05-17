import proxy from "express-http-proxy"
import type { RequestHandler } from "express"

export const partytownProxyPath = `/__partytown-proxy`

export function partytownProxy(proxiedURLs: Array<string>): RequestHandler {
  return proxy(req => new URL(req.query.url as string).origin as string, {
    filter: req => proxiedURLs.some(url => req.query?.url === url),
    proxyReqPathResolver: req => {
      const { pathname = ``, search = `` } = new URL(req.query?.url as string)
      return pathname + search
    },
  })
}
