import { NodePluginArgs } from "gatsby"

const pattern = /^gid:\/\/shopify\/(\w+)\/(.+)$/

const { CI, GATSBY_CLOUD, GATSBY_IS_PR_BUILD, NETLIFY, CONTEXT } = process.env

export function createNodeId(
  shopifyId: string,
  gatsbyApi: NodePluginArgs,
  { typePrefix = `` }: IShopifyPluginOptions
): string {
  return gatsbyApi.createNodeId(`${typePrefix}${shopifyId}`)
}

export function getPluginStatus(gatsbyApi: NodePluginArgs): any {
  return (
    gatsbyApi.store.getState().status.plugins?.[`gatsby-source-shopify`] || {}
  )
}

export function getLastBuildTime(
  gatsbyApi: NodePluginArgs,
  pluginOptions: IShopifyPluginOptions
): Date | undefined {
  const { typePrefix = `` } = pluginOptions
  const status = getPluginStatus(gatsbyApi)

  return (
    status[`lastBuildTime${typePrefix}`] &&
    new Date(status[`lastBuildTime${typePrefix}`])
  )
}

export function setCurrentBuildTime(
  gatsbyApi: NodePluginArgs,
  pluginOptions: IShopifyPluginOptions
): void {
  const { typePrefix = `` } = pluginOptions
  const status = getPluginStatus(gatsbyApi)

  gatsbyApi.actions.setPluginStatus({
    ...status,
    [`currentBuildTime${typePrefix}`]: Date.now(),
  })
}

export function setLastBuildTime(
  gatsbyApi: NodePluginArgs,
  pluginOptions: IShopifyPluginOptions
): void {
  const { typePrefix = `` } = pluginOptions
  const status = getPluginStatus(gatsbyApi)

  gatsbyApi.actions.setPluginStatus({
    ...status,
    [`currentBuildTime${typePrefix}`]: undefined,
    [`lastBuildTime${typePrefix}`]: status[`currentBuildTime${typePrefix}`],
  })
}

export function isPriorityBuild(pluginOptions: IShopifyPluginOptions): boolean {
  const isGatsbyCloudPriorityBuild =
    CI === `true` && GATSBY_CLOUD === `true` && GATSBY_IS_PR_BUILD !== `true`

  const isNetlifyPriorityBuild =
    CI === `true` && NETLIFY === `true` && CONTEXT === `production`

  return pluginOptions.prioritize !== undefined
    ? pluginOptions.prioritize
    : isGatsbyCloudPriorityBuild || isNetlifyPriorityBuild
}

export function isShopifyId(shopifyId: string): boolean {
  return pattern.test(shopifyId)
}

export function parseShopifyId(shopifyId: string): Array<string> {
  return shopifyId.match(pattern) || []
}

export function parseImageExtension(url: string): string {
  const basename = url.split(`?`)[0]
  const dot = basename.lastIndexOf(`.`)

  if (dot !== -1) {
    return basename.slice(dot + 1)
  } else {
    throw new Error(
      `Could not parse file extension from Shopify image URL: ${url}`
    )
  }
}
