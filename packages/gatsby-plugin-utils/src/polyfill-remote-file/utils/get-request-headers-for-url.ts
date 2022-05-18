import url from "url"
import path from "path"
import importFrom from "import-from"
import resolveFrom from "resolve-from"

import type { Headers } from "got"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getStore(): any {
  const gatsbyPkgRoot = path.dirname(
    resolveFrom(process.cwd(), `gatsby/package.json`)
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { store } = importFrom(gatsbyPkgRoot, `gatsby/dist/redux`) as any

  return store
}

export function getRequestHeadersForUrl(
  passedUrl: string
): Headers | undefined {
  const baseDomain = url.parse(passedUrl).hostname
  const { requestHeaders } = getStore().getState()

  return baseDomain ? requestHeaders?.get(baseDomain) : undefined
}
