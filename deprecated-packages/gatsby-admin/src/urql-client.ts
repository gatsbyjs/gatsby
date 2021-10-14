/* eslint-disable */
import {
  Client,
  createClient,
  defaultExchanges,
  subscriptionExchange,
} from "urql"
import { SubscriptionClient } from "subscriptions-transport-ws"

interface ICreateUrqlClientOptions {
  port: number
  connectionCallback?: any
}

export const createUrqlClient = ({
  port,
  connectionCallback = () => {},
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

  subscriptionClient.connectionCallback = connectionCallback

  return client
}
