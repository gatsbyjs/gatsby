import url from "url"
import path from "path"
import importFrom from "import-from"
import resolveFrom from "resolve-from"

import type { Headers } from "got"

export function getStore(): typeof import("gatsby/src/redux")["store"] {
  const gatsbyPkgRoot = path.dirname(
    resolveFrom(process.cwd(), `gatsby/package.json`)
  )

  const { store } = importFrom(
    gatsbyPkgRoot,
    `gatsby/dist/redux`
  ) as typeof import("gatsby/src/redux")

  return store
}

export function getRequestHeadersForUrl(
  passedUrl: string
): Headers | undefined {
  const baseDomain = url.parse(passedUrl).hostname
  const { requestHeaders } = getStore().getState()

  return baseDomain ? requestHeaders?.get(baseDomain) : undefined
}
