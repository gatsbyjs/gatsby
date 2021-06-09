import { makeShopifyFetch } from "./rest";

interface Event {
  subject_id: number;
  subject_type: string;
}

export function eventsApi(options: ShopifyPluginOptions) {
  const shopifyFetch = makeShopifyFetch(options);

  return {
    async fetchDestroyEventsSince(date: Date): Promise<Event[]> {
      let resp = await shopifyFetch(
        `/events.json?limit=250&verb=destroy&created_at_min=${date.toISOString()}`
      );

      const { events } = await resp.json();

      while (true) {
        const paginationInfo = resp.headers.get("link");
        if (!paginationInfo) {
          break;
        }

        const pageLinks: { url: string; rel: string }[] = paginationInfo
          .split(",")
          .map((pageData: string) => {
            const [, url, rel] = pageData.match(/<(.*)>; rel="(.*)"/) || [];
            return {
              url,
              rel,
            };
          });

        const nextPage = pageLinks.find((l) => l.rel === `next`);

        if (nextPage) {
          resp = await shopifyFetch(nextPage.url);
          const { events: nextEvents } = await resp.json();
          events.push(...nextEvents);
        } else {
          break;
        }
      }

      return events;
    },
  };
}
