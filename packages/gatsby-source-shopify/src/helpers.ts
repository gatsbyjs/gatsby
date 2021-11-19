import { SourceNodesArgs } from "gatsby"

const pattern = /^gid:\/\/shopify\/(\w+)\/(.+)$/

export function createNodeId(
  shopifyId: string,
  gatsbyApi: SourceNodesArgs,
  { typePrefix = `` }: ShopifyPluginOptions
): string {
  return gatsbyApi.createNodeId(`${typePrefix}${shopifyId}`)
}

export function getPluginStatus(gatsbyApi: SourceNodesArgs) {
  return gatsbyApi.store.getState().status.plugins?.[`gatsby-source-shopify`] || []
}

export function getLastBuildTime(gatsbyApi: SourceNodesArgs, pluginOptions: ShopifyPluginOptions) {
  const { typePrefix = `` } = pluginOptions
  const status = getPluginStatus(gatsbyApi)

  return status[`lastBuildTime${typePrefix}`] && new Date(status[`lastBuildTime${typePrefix}`])
}

export function isShopifyId(shopifyId: string) {
  return pattern.test(shopifyId)
}

export function parseShopifyId(shopifyId: string) {
  return shopifyId.match(pattern) || []
}
