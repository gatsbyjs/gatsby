import url from "url"

import type { Headers } from "got"
import type { Store } from "gatsby"
import reporter from "gatsby-cli/lib/reporter"

export function getRequestHeadersForUrl(
  passedUrl: string,
  store: Store
): Headers | undefined {
  if (!store || !(`getState` in store)) {
    reporter.warn(
      `getRequestHeadersForUrl: argument 2 "store" is not a redux store. Please pass Gatsby's redux store. (for url ${passedUrl})`
    )

    return undefined
  }

  const baseDomain = url.parse(passedUrl).hostname
  const { requestHeaders } = store.getState()

  return baseDomain ? requestHeaders?.get(baseDomain) : undefined
}
