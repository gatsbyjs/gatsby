import { NodePluginArgs, SourceNodesArgs } from "gatsby"
import { createRemoteFileNode } from "gatsby-source-filesystem"

import { shopifyTypes } from "./shopify-types"

const pattern = /^gid:\/\/shopify\/(\w+)\/(.+)$/

export function createNodeId(
  shopifyId: string,
  gatsbyApi: NodePluginArgs,
  { typePrefix }: IShopifyPluginOptions
): string {
  return gatsbyApi.createNodeId(`${typePrefix}${shopifyId}`)
}

export function getPluginStatus(
  gatsbyApi: NodePluginArgs
): Record<string, never> {
  return (
    gatsbyApi.store.getState().status.plugins?.[`gatsby-source-shopify`] || {}
  )
}

export function getLastBuildTime(
  gatsbyApi: NodePluginArgs,
  pluginOptions: IShopifyPluginOptions
): Date | undefined {
  const { typePrefix } = pluginOptions
  const status = getPluginStatus(gatsbyApi)

  return (
    status[`lastBuildTime${typePrefix}`] &&
    new Date(status[`lastBuildTime${typePrefix}`])
  )
}

export function setLastBuildTime(
  gatsbyApi: NodePluginArgs,
  pluginOptions: IShopifyPluginOptions,
  currentBuildTime: number
): void {
  const { typePrefix } = pluginOptions
  const status = getPluginStatus(gatsbyApi)

  gatsbyApi.actions.setPluginStatus({
    ...status,
    [`lastBuildTime${typePrefix}`]: currentBuildTime,
  })
}

export function isPriorityBuild(pluginOptions: IShopifyPluginOptions): boolean {
  const { CI, GATSBY_CLOUD, GATSBY_IS_PR_BUILD, NETLIFY, CONTEXT } = process.env

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

export function decorateBulkObject(
  input: unknown,
  createGatsbyNodeId: (shopifyId: string) => string,
  inputKey: string | null = null,
  parent: unknown | null = null
): unknown {
  if (input && typeof input === `object`) {
    if (Array.isArray(input)) {
      return input.map(item =>
        decorateBulkObject(item, createGatsbyNodeId, inputKey, input)
      )
    }

    const obj: Record<string, unknown> = { ...input }

    for (const key of Object.keys(obj)) {
      obj[key] = decorateBulkObject(obj[key], createGatsbyNodeId, key, obj)
    }

    // We must convert ID to ShopifyID so that it doesn't collide with Gatsby's internal ID
    if (obj.id) {
      obj.shopifyId = obj.id
      delete obj.id

      // if an object only has an ID, we know it's a node reference
      // so we create a Gatsby node ID for it on a new field to avoid introducing a breaking change
      if (Object.keys(input).length === 1 && parent) {
        ;(parent as Record<string, unknown>)[`_${inputKey}`] =
          createGatsbyNodeId(obj.shopifyId as string)
      }
    }

    return obj
  }

  return input
}

export async function processShopifyImages(
  { actions: { createNode }, createNodeId, cache }: SourceNodesArgs,
  node: IShopifyNode
): Promise<void> {
  const type = parseShopifyId(node.shopifyId)[1]
  const imageFields = shopifyTypes[type].imageFields

  if (imageFields) {
    for (const fieldPath of imageFields) {
      const image = fieldPath
        .split(`.`)
        .reduce((acc, value) => acc[value] as never, node) as
        | IShopifyImage
        | undefined

      if (image && parseImageExtension(image.originalSrc) !== `gif`) {
        const fileNode = await createRemoteFileNode({
          url: image.originalSrc,
          cache,
          createNode,
          createNodeId,
          parentNodeId: node.id,
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
