import {
  Client,
  createClient,
  defaultExchanges,
  subscriptionExchange,
} from "urql"
import { SubscriptionClient } from "subscriptions-transport-ws"

interface ICreateUrqlClientOptions {
  port: number
}

export const createUrqlClient = ({
  port,
}: ICreateUrqlClientOptions): Client => {
  const subscriptionClient = new SubscriptionClient(
    `ws://localhost:${port}/graphql`,
    {
      reconnect: true,
    }
  )

  const client = createClient({
    fetch,
    url: `http://localhost:${port}/graphql`,
    exchanges: [
      ...defaultExchanges,
      subscriptionExchange({
        forwardSubscription(operation) {
          return subscriptionClient.request(operation)
        },
      }),
    ],
  })

  return client
}
