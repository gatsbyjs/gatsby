import url from "url"
import { store } from "../redux"

import type { Headers } from "got"

export function getRequestHeadersForUrl(
  passedUrl: string
): Headers | undefined {
  const baseDomain = url.parse(passedUrl).hostname
  const { requestHeaders } = store.getState()

  return baseDomain ? requestHeaders?.get(baseDomain) : undefined
}
