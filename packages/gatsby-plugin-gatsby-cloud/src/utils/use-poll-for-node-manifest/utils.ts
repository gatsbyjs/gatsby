import { DEBUG_CONTENT_SYNC_MODE } from "./constants"
import {
  INodeManifestOut,
  IPageData,
  IPageDataJsonParams,
  IProxyRequestError,
} from "./types"

/**
 * Returns a fixed path for requesting page-data.json files.
 */
export function fixedPagePath(pagePath: string): string {
  return pagePath === `/` ? `/index` : pagePath
}

/**
 * If the request would result in CORS errors, it is proxied automatically through a Gatsby function on Gatsby Cloud (proxying only works when this function is called from within Gatsby Cloud).
 */
export const maybeProxiedRequest = async ({
  url,
  skipJson = false,
}: {
  url: string
  skipJson?: boolean
}): Promise<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
  exists?: boolean
  statusCode?: number
  error?: IProxyRequestError | Error
  passwordProtected?: true
}> => {
  const parsedUrl = new URL(url)

  // fix pathnames that have double forward slashes //
  url = `${parsedUrl.origin}${parsedUrl.pathname.replace(/\/\//g, `/`)}`

  const shouldProxy =
    window.location.host !== parsedUrl.host &&
    window.location.host !== `localhost:8000`

  if (shouldProxy) {
    if (DEBUG_CONTENT_SYNC_MODE) {
      console.info(`requesting /api/content-sync-json-proxy with url ${url}`)
    }

    const response = await fetch(`/api/content-sync-json-proxy`, {
      method: `POST`,
      headers: {
        "Content-Type": `application/json`,
      },
      body: JSON.stringify({
        url,
      }),
    })

    const responseJson = await response.json()

    if (DEBUG_CONTENT_SYNC_MODE) {
      console.info({ response, responseJson })
    }

    return responseJson
  }
  // here we're not using a proxy like above since requests are for the same domain.
  else {
    try {
      const response = await fetch(url)

      if (DEBUG_CONTENT_SYNC_MODE) {
        console.info({ response })
      }

      if (response.ok) {
        const json = !skipJson ? await response.json() : null

        return {
          data: json,
          exists: true,
          statusCode: 200,
        }
      } else {
        return {
          data: null,
          exists: false,
        }
      }
    } catch (error) {
      console.error(error)
      return {
        error,
      }
    }
  }
}

/**
 * Used to check if a redirect url exists before we redirect the user.
 */
export const doesUrlExist = async (url: string): Promise<boolean> => {
  const responseJson = await maybeProxiedRequest({ url, skipJson: true })

  return !!responseJson?.exists
}

export const fetchPageDataJson = async ({
  manifest,
  frontendUrl,
}: IPageDataJsonParams): Promise<null | IPageData> => {
  if (!manifest?.page?.path) {
    return null
  }

  const pageDataUrl = `${frontendUrl}/page-data${fixedPagePath(
    manifest.page.path
  )}/page-data.json`

  if (DEBUG_CONTENT_SYNC_MODE) {
    console.info(`requesting /api/content-sync-json-proxy`)
  }

  const { data: pageData } = await maybeProxiedRequest({
    url: pageDataUrl,
  })

  return pageData
}

export const doesPageManifestIdMatch = async (
  params: IPageDataJsonParams,
  pageDataJson?: IPageData | null
): Promise<boolean> => {
  const pageData = pageDataJson || (await fetchPageDataJson(params))

  if (pageData) {
    if (DEBUG_CONTENT_SYNC_MODE) {
      console.info(`checking if page data manifest id matches url manifest id`)
    }

    const { manifestId } = pageData
    const { manifest } = params

    const idsMatch = manifestId === manifest?.id

    if (!idsMatch && DEBUG_CONTENT_SYNC_MODE) {
      console.info(`Manifest id's don't match`)
    }

    if (DEBUG_CONTENT_SYNC_MODE) {
      console.info({
        pageDataManifestId: manifestId,
        manifestId: manifest?.id,
      })
    }

    return idsMatch
  }

  return false
}

let urlExists = false
let checkPageDataDigestCounter = 0
const MAX_PAGE_DATA_CHECKS = 6

/**
 * Waits for the redirect url to be available
 * then checks the manifest.pageDataDigest against the sites page-data.json to make sure the page-data.json has finished deploying and propagating
 */
export const waitForPageDataToBeDeployed = async ({
  redirectUrl,
  manifest,
  frontendUrl,
}: {
  redirectUrl: string
  manifest?: INodeManifestOut
  frontendUrl: string
}): Promise<true | undefined> => {
  urlExists = urlExists || (await doesUrlExist(redirectUrl))

  if (urlExists) {
    if (DEBUG_CONTENT_SYNC_MODE) {
      console.info(`url ${redirectUrl} exists!`)
    }

    const pageDataParams = {
      manifest,
      frontendUrl,
    }

    const pageData = await fetchPageDataJson(pageDataParams)

    if (pageData?.manifestId) {
      const manifestIdsMatch = await doesPageManifestIdMatch(
        pageDataParams,
        pageData
      )
      if (manifestIdsMatch) {
        return true
      } else if (DEBUG_CONTENT_SYNC_MODE) {
        console.info(`page data json manifest doesn't match.`)
      }
    } else {
      return true
    }

    // if not, wait .5 seconds
    await new Promise(resolve => setTimeout(resolve, 500))

    // if we've already checked MAX_PAGE_DATA_CHECKS times then redirect anyway.
    if (checkPageDataDigestCounter >= MAX_PAGE_DATA_CHECKS) {
      return true
    } else {
      // otherwise increase counter and try again
      checkPageDataDigestCounter++

      return waitForPageDataToBeDeployed({
        redirectUrl,
        manifest,
        frontendUrl,
      })
    }
  } else {
    // The redirectUrl isn't returning a 200 yet. This is for brand new pages that didn't previously exist.
    if (DEBUG_CONTENT_SYNC_MODE) {
      console.info(
        `url ${redirectUrl} not found. Waiting 100ms and re-checking.`
      )
    }

    await new Promise(resolve => setTimeout(resolve, 100))

    return waitForPageDataToBeDeployed({
      redirectUrl,
      manifest,
      frontendUrl,
    })
  }
}

const startTime = Date.now()

/**
 * Fetches the corresponding node manifest file from the users Gatsby site
 */
export const fetchNodeManifest = async ({
  manifestId,
  sourcePluginName,
  pollCallback,
  frontendUrl,
  setShowError,
}: {
  manifestId: string
  siteId: string | null
  sourcePluginName: string
  pollCallback: (() => void) | undefined
  frontendUrl: string
  setShowError: (arg: boolean) => void
}): Promise<{
  manifest?: INodeManifestOut
  error?: IProxyRequestError | Error
  shouldPoll: boolean
  loadingDuration?: number
  redirectUrl?: string
}> => {
  let {
    data: manifest,
    error,
    passwordProtected,
  } = await maybeProxiedRequest({
    url: `${frontendUrl}/__node-manifests/${sourcePluginName}/${manifestId}.json`,
  })

  if (passwordProtected) {
    return {
      shouldPoll: false,
      error: {
        code: 401,
        passwordProtected,
      },
    }
  }

  if (manifest) {
    manifest = {
      ...manifest,
      id: manifestId,
    }

    const { page, foundPageBy } = manifest

    if (DEBUG_CONTENT_SYNC_MODE) {
      console.info(`found manifest after ${Date.now() - startTime}ms`, {
        manifest,
      })
    }

    if (page?.path) {
      const urlAvailableTimeout = setTimeout(() => {
        // if the url isn't available within 30 seconds, set an error
        setShowError(true)
      }, 30000)

      const redirectUrl = `${frontendUrl}${page.path}`

      if (DEBUG_CONTENT_SYNC_MODE) {
        console.info(`waiting for ${redirectUrl} to be available`)
      }

      const pageIsReady = await waitForPageDataToBeDeployed({
        redirectUrl,
        manifest,
        frontendUrl,
      })

      if (pageIsReady) {
        clearTimeout(urlAvailableTimeout)

        const loadingDuration = Date.now() - startTime

        // this is to prevent redirecting during development.
        const shouldRedirect = DEBUG_CONTENT_SYNC_MODE
          ? window.confirm(
              `GATSBY_DEBUG_CONTENT_SYNC enabled: Ready to redirect to ${redirectUrl} after ${loadingDuration}ms. Should I redirect you now?`
            )
          : true

        return {
          shouldPoll: false,
          manifest,
          redirectUrl: shouldRedirect ? redirectUrl : undefined,
          loadingDuration,
        }
      }
    } else if (foundPageBy === `none`) {
      // a page was not created for the node being previewed
      return { shouldPoll: false, manifest }
    }
  } else if (error) {
    return { shouldPoll: false, error }
  } else if (typeof pollCallback === `function`) {
    pollCallback()
  }

  return { shouldPoll: true }
}
