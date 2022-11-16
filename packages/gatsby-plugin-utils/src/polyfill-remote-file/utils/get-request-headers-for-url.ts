import url from "url"

import type { Headers } from "got"
import type { Store } from "gatsby"

let loggedWarning = false

export function getRequestHeadersForUrl(
  passedUrl: string,
  store?: Store
): Headers | undefined {
  const storeIsMissing = !store || !(`getState` in store)

  if (storeIsMissing && !loggedWarning) {
    loggedWarning = true
    console.warn(
      `Gatsby's redux store is required in the "addRemoteFilePolyfillInterface" and "polyfillImageServiceDevRoutes" API's for image CDN. No store was found when requesting url "${passedUrl}". This will fail your build in Gatsby V5. Upgrade your source plugins and Gatsby packages to the latest versions to resolve this. If you are a source plugin author visit https://gatsby.dev/source-plugins-image-cdn to learn how to make this warning go away.`
    )
  }

  if (storeIsMissing) {
    return undefined
  }

  const baseDomain = url.parse(passedUrl).hostname
  const { requestHeaders } = store.getState()

  return baseDomain ? requestHeaders?.get(baseDomain) : undefined
}
