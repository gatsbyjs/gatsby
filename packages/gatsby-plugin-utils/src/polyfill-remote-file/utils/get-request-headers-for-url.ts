import url from "url"
import path from "path"
import importFrom from "import-from"
import resolveFrom from "resolve-from"

import type { Headers } from "got"
import type { Store } from "gatsby"

export function getStore(): Store {
  const gatsbyPkgRoot = path.dirname(
    resolveFrom(process.cwd(), `gatsby/package.json`)
  )

  const { store } = importFrom(gatsbyPkgRoot, `gatsby/dist/redux`) as {
    store: Store | undefined
  }

  if (store) {
    return store
  } else {
    const { store: requiredStore } = require(`gatsby/dist/redux`) as {
      store: Store
    }

    return requiredStore
  }
}

export function getRequestHeadersForUrl(
  passedUrl: string
): Headers | undefined {
  const baseDomain = url.parse(passedUrl).hostname
  const { requestHeaders } = getStore().getState()

  return baseDomain ? requestHeaders?.get(baseDomain) : undefined
}
