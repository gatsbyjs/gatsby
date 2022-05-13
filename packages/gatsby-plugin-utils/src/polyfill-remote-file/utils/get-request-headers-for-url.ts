import { store } from "gatsby/dist/redux"
import url from "url"
import type { Headers } from "got"

export function getRequestHeadersForUrl(
  passedUrl: string
): Headers | undefined {
  const baseDomain = url.parse(passedUrl).hostname
  const { requestHeaders } = store.getState()

  return requestHeaders.get(baseDomain)
}
