import url from "url"

import type { Headers } from "got"
import type { Store } from "gatsby"

export function getRequestHeadersForUrl(
  passedUrl: string,
  store: Store
): Headers | undefined {
  if (!store || !(`getState` in store)) {
    throw new Error(
      `getRequestHeadersForUrl: argument 2 "store" is not a redux store. Please pass Gatsby's redux store. (for url ${passedUrl})`
    )
  }

  const baseDomain = url.parse(passedUrl).hostname
  const { requestHeaders } = store.getState()

  return baseDomain ? requestHeaders?.get(baseDomain) : undefined
}
