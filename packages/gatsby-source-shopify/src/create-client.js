import { GraphQLClient } from "graphql-request"
/**
 * Create a Shopify Storefront GraphQL client for the provided name and token.
 */
export const createClient = (shopName, accessToken) => {
  let url
  if (shopName.includes(`.`)) {
    url = `https://${shopName}/api/graphql`
  } else {
    url = `https://${shopName}.myshopify.com/api/graphql`
  }
  return new GraphQLClient(url, {
    headers: {
      "X-Shopify-Storefront-Access-Token": accessToken,
    },
  })
}
