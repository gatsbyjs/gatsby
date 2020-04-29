const { createClient, defaultExchanges, subscriptionExchange } = require(`urql`)
const { SubscriptionClient } = require(`subscriptions-transport-ws`)

const subscriptionClient = new SubscriptionClient(
  `ws://localhost:4000/graphql`,
  {
    reconnect: true,
  }
)

const client = createClient({
  fetch,
  url: `http://localhost:4000/graphql`,
  exchanges: [
    ...defaultExchanges,
    subscriptionExchange({
      forwardSubscription(operation) {
        return subscriptionClient.request(operation)
      },
    }),
  ],
})

export default client
