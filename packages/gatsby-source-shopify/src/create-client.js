import { GraphQLClient } from "graphql-request"
/**
 * Create a Shopify Storefront GraphQL client for the provided name and token.
 */
export const createClient = (shopName, accessToken, apiVersion) => {
  let url
  if (shopName.includes(`.`)) {
    url = `https://${shopName}/api/${apiVersion}/graphql.json`
  } else {
    url = `https://${shopName}.myshopify.com/api/${apiVersion}/graphql.json`
  }
  return new GraphQLClient(url, {
    headers: {
      "X-Shopify-Storefront-Access-Token": accessToken,
    },
  })
}
