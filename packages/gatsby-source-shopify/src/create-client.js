import { GraphQLClient } from "graphql-request"
/**
 * Create a Shopify Storefront GraphQL client for the provided name and token.
 */
export const createClient = (shopName, accessToken) =>
  new GraphQLClient(`https://${shopName}.myshopify.com/api/graphql`, {
    headers: {
      "X-Shopify-Storefront-Access-Token": accessToken,
    },
  })
