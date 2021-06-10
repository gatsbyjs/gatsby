import fetch, { Response } from "node-fetch"

const getBaseUrl = (options: ShopifyPluginOptions): string =>
  `https://${options.storeUrl}/admin/api/2021-01`

export function makeShopifyFetch(
  options: ShopifyPluginOptions
): (path: string) => Promise<Response> {
  const baseUrl = getBaseUrl(options)

  async function shopifyFetch(
    path: string,
    fetchOptions = {
      headers: {
        "X-Shopify-Access-Token": options.password,
      },
    },
    retries = 3
  ): Promise<Response> {
    /**
     * This is kind of a hack, but...
     *
     * We do this because although callers will use a relative path,
     * some responses might have pagination links that get fed back
     * to shopifyFetch to retrieve the next page. Those links are
     * absolute URLs so we account for both, but not in a very robust
     * fashion.
     */
    const url = path.includes(options.storeUrl) ? path : `${baseUrl}${path}`

    const resp = await fetch(url, fetchOptions)

    if (!resp.ok) {
      if (retries > 0) {
        if (resp.status === 429) {
          // rate limit
          const retryAfter = parseFloat(resp.headers.get(`Retry-After`) || ``)
          await new Promise(resolve => setTimeout(resolve, retryAfter))
          return shopifyFetch(path, fetchOptions, retries - 1)
        }
      }
    }

    return resp
  }

  return async (path: string): Promise<Response> => shopifyFetch(path)
}
