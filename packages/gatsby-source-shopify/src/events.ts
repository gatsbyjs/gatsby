import { makeShopifyFetch } from "./rest"

interface IEvent {
  subject_id: number
  subject_type: string
}

export function eventsApi(
  options: ShopifyPluginOptions
): Record<string, unknown> {
  const shopifyFetch = makeShopifyFetch(options)

  return {
    async fetchDestroyEventsSince(date: Date): Promise<Array<IEvent>> {
      let resp = await shopifyFetch(
        `/events.json?limit=250&verb=destroy&created_at_min=${date.toISOString()}`
      )

      const { events } = await resp.json()

      let gatherPaginatedEvents = true

      while (gatherPaginatedEvents) {
        const paginationInfo = resp.headers.get(`link`)
        if (!paginationInfo) {
          gatherPaginatedEvents = false
          break
        }

        const pageLinks: Array<{
          url: string
          rel: string
        }> = paginationInfo.split(`,`).map((pageData: string) => {
          const [, url, rel] = pageData.match(/<(.*)>; rel="(.*)"/) || []
          return {
            url,
            rel,
          }
        })

        const nextPage = pageLinks.find(l => l.rel === `next`)

        if (nextPage) {
          resp = await shopifyFetch(nextPage.url)
          const { events: nextEvents } = await resp.json()
          events.push(...nextEvents)
        } else {
          gatherPaginatedEvents = false
          break
        }
      }

      return events
    },
  }
}
