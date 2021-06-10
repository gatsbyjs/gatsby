import { NodeInput, SourceNodesArgs } from "gatsby"
import { createRemoteFileNode } from "gatsby-source-filesystem"

// 'gid://shopify/Metafield/6936247730264'
export const pattern = /^gid:\/\/shopify\/(\w+)\/(.+)$/

export function createNodeId(
  shopifyId: string,
  gatsbyApi: SourceNodesArgs,
  { typePrefix = `` }: ShopifyPluginOptions
): string {
  return gatsbyApi.createNodeId(`${typePrefix}${shopifyId}`)
}

function attachParentId(
  result: BulkResult,
  gatsbyApi: SourceNodesArgs,
  pluginOptions: ShopifyPluginOptions
): void {
  if (result.__parentId) {
    const [fullId, remoteType] = result.__parentId.match(pattern) || []
    const field = remoteType.charAt(0).toLowerCase() + remoteType.slice(1)
    const idField = `${field}Id`
    result[idField] = createNodeId(fullId, gatsbyApi, pluginOptions)
  }
}

const downloadImageAndCreateFileNode = async (
  { url, nodeId }: { url: string; nodeId: string },
  {
    actions: { createNode },
    createNodeId,
    cache,
    store,
    reporter,
  }: SourceNodesArgs
): Promise<string> => {
  const fileNode = await createRemoteFileNode({
    url,
    cache,
    createNode,
    createNodeId,
    parentNodeId: nodeId,
    store,
    reporter,
  })

  return fileNode.id
}

interface IProcessorMap {
  [remoteType: string]: (
    node: NodeInput,
    gatsbyApi: SourceNodesArgs,
    pluginOptions: ShopifyPluginOptions
  ) => Promise<void>
}

interface IImageData {
  id: string
  originalSrc: string
  localFile: string | undefined
}

async function processChildImage(
  node: NodeInput,
  getImageData: (node: NodeInput) => IImageData | undefined,
  gatsbyApi: SourceNodesArgs,
  pluginOptions: ShopifyPluginOptions
): Promise<void> {
  if (pluginOptions.downloadImages) {
    const image = getImageData(node)

    if (image) {
      const url = image.originalSrc
      const fileNodeId = await downloadImageAndCreateFileNode(
        {
          url,
          nodeId: node.id,
        },
        gatsbyApi
      )

      image.localFile = fileNodeId
    }
  }
}

export const processorMap: IProcessorMap = {
  LineItem: async (node, gatsbyApi, pluginOptions) => {
    const lineItem = node
    if (lineItem.product) {
      lineItem.productId = createNodeId(
        (lineItem.product as BulkResult).id,
        gatsbyApi,
        pluginOptions
      )
      delete lineItem.product
    }
  },
  ProductImage: async (node, gatsbyApi, options) => {
    if (options.downloadImages) {
      const url = node.originalSrc as string
      const fileNodeId = await downloadImageAndCreateFileNode(
        {
          url,
          nodeId: node.id,
        },
        gatsbyApi
      )

      node.localFile = fileNodeId
    }
  },
  Collection: async (node, gatsbyApi, options) =>
    processChildImage(
      node,
      node => node.image as IImageData,
      gatsbyApi,
      options
    ),
  Product: async (node, gatsbyApi, options) => {
    await processChildImage(
      node,
      node => node.featuredImage as IImageData,
      gatsbyApi,
      options
    )
    await processChildImage(
      node,
      node => {
        const media = node.featuredMedia as
          | {
              preview?: {
                image?: IImageData
              }
            }
          | undefined

        return media?.preview?.image
      },
      gatsbyApi,
      options
    )
  },
  ProductVariant: async (node, gatsbyApi, options) =>
    processChildImage(
      node,
      node => node.image as IImageData,
      gatsbyApi,
      options
    ),
  Metafield: async (node, _gatsbyApi, { typePrefix = `` }) => {
    const [, parentType] = (node.__parentId as string).match(pattern) || []
    const internalType = `${typePrefix}Shopify${parentType}Metafield`
    node.internal.type = internalType
  },
}

export function nodeBuilder(
  gatsbyApi: SourceNodesArgs,
  pluginOptions: ShopifyPluginOptions
): NodeBuilder {
  return {
    async buildNode(result: BulkResult): Promise<any> {
      if (!pattern.test(result.id)) {
        throw new Error(
          `Expected an ID in the format gid://shopify/<typename>/<id>`
        )
      }

      const [, remoteType] = result.id.match(pattern) || []

      const processor =
        processorMap[remoteType] || ((): Promise<void> => Promise.resolve())

      attachParentId(result, gatsbyApi, pluginOptions)

      const node = {
        ...result,
        shopifyId: result.id,
        id: createNodeId(result.id, gatsbyApi, pluginOptions),
        internal: {
          type: `${pluginOptions.typePrefix || ``}Shopify${remoteType}`,
          contentDigest: gatsbyApi.createContentDigest(result),
        },
      }

      await processor(node, gatsbyApi, pluginOptions)

      return node
    },
  }
}
