import { createRestClient } from "./clients";

type IEvent = {
  subject_id: number;
  subject_type: string;
};

export function eventsApi(options: IShopifyPluginOptions): {
  fetchDestroyEventsSince: (date: Date) => Promise<Array<IEvent>>;
} {
  const restClient = createRestClient(options);

  return {
    async fetchDestroyEventsSince(date): Promise<Array<IEvent>> {
      let resp = await restClient.request(
        `/events.json?limit=250&verb=destroy&created_at_min=${date.toISOString()}`,
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: { events: Array<IEvent> } = (await resp.json()) as any;

      let gatherPaginatedEvents = true;

      while (gatherPaginatedEvents) {
        const paginationInfo = resp.headers.get("link");
        if (!paginationInfo) {
          gatherPaginatedEvents = false;
          break;
        }

        const pageLinks: Array<{
          url: string;
          rel: string;
        }> = paginationInfo.split(",").map((pageData: string) => {
          const [, url, rel] = pageData.match(/<(.*)>; rel="(.*)"/) || [];
          return {
            url,
            rel,
          };
        });

        const nextPage = pageLinks.find((l) => l.rel === "next");

        if (nextPage) {
          resp = await restClient.request(nextPage.url);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result: { events: Array<IEvent> } = (await resp.json()) as any;
          const { events: nextEvents } = result;

          result.events.push(...nextEvents);
        } else {
          gatherPaginatedEvents = false;
          break;
        }
      }

      return result.events;
    },
  };
}
