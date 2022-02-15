import { NodePluginArgs, SourceNodesArgs } from "gatsby"
import { createRemoteFileNode } from "gatsby-source-filesystem"

import { shopifyTypes } from "./shopify-types"

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

export function decorateBulkObject(input: IBulkResult): IDecoratedResult {
  const obj: { id?: string; shopifyId?: string; [key: string]: any } = {
    ...input,
  }

  if (typeof obj === `object`) {
    if (obj.id) {
      obj.shopifyId = obj.id
      delete obj.id
    }

    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === `object`) obj[key] = decorateBulkObject(obj[key])
    }
  }

  return obj as IShopifyNode
}

export async function processShopifyImages(
  {
    actions: { createNode },
    createNodeId,
    cache,
    store,
    reporter,
  }: SourceNodesArgs,
  node: IShopifyNode
): Promise<void> {
  const type = parseShopifyId(node.shopifyId)[1]
  const imageFields = shopifyTypes[type].imageFields

  if (imageFields) {
    for (const fieldPath of imageFields) {
      const image = fieldPath
        .split(`.`)
        .reduce((acc, value) => acc[value], node)

      if (image && parseImageExtension(image.originalSrc) !== `gif`) {
        const fileNode = await createRemoteFileNode({
          url: image.originalSrc,
          cache,
          createNode,
          createNodeId,
          parentNodeId: node.id,
          store,
          reporter,
        })

        image.localFile___NODE = fileNode.id
      }
    }
  }
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
