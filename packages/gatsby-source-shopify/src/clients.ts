import fetch, { Response } from "node-fetch"
import { HttpError } from "./errors"

const MAX_BACKOFF_MILLISECONDS = 60000

// TODO Update logic for handling errors (500 specifically) and update the
// "hacky" code in createRestClient

export function createGraphqlClient(
  options: IShopifyPluginOptions
): IGraphQLClient {
  const url = `https://${options.storeUrl}/admin/api/${options.apiVersion}/graphql.json`

  async function graphqlFetch<T>(
    query: string,
    variables?: Record<string, unknown>,
    retries = 0
  ): Promise<T> {
    const response = await fetch(url, {
      method: `POST`,
      headers: {
        "Content-Type": `application/json`,
        "X-Shopify-Access-Token": options.password,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    if (!response.ok) {
      const waitTime = 2 ** (retries + 1) + 500
      if (response.status >= 500 && waitTime < MAX_BACKOFF_MILLISECONDS) {
        await new Promise(resolve => setTimeout(resolve, waitTime))
        return graphqlFetch(query, variables, retries + 1)
      }

      throw new HttpError(response)
    }

    const json = await response.json()
    return json.data as T
  }

  return { request: graphqlFetch }
}

export function createRestClient(options: IShopifyPluginOptions): IRestClient {
  const baseUrl = `https://${options.storeUrl}/admin/api/${options.apiVersion}`

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

    if (!resp.ok && retries > 0 && resp.status === 429) {
      // rate limit
      const retryAfter = parseFloat(resp.headers.get(`Retry-After`) || ``)
      await new Promise(resolve => setTimeout(resolve, retryAfter))
      return shopifyFetch(path, fetchOptions, retries - 1)
    }

    return resp
  }

  return {
    request: async (path: string): Promise<Response> => shopifyFetch(path),
  }
}
