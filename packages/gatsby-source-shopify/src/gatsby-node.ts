import { createOperations } from "./operations"
import { eventsApi } from "./events"
import {
  CreateResolversArgs,
  NodePluginArgs,
  PluginOptionsSchemaArgs,
  SourceNodesArgs,
} from "gatsby"
import { makeResolveGatsbyImageData } from "./resolve-gatsby-image-data"
import {
  getGatsbyImageResolver,
  IGatsbyGraphQLResolverArgumentConfig,
} from "gatsby-plugin-image/graphql-utils"
import { makeSourceFromOperation } from "./make-source-from-operation"
export { createSchemaCustomization } from "./create-schema-customization"
import { createNodeId } from "./node-builder"
import { ERROR_MAP } from "./error-map"

let coreSupportsOnPluginInit: `unstable` | `stable` | undefined

try {
  const { isGatsbyNodeLifecycleSupported } = require(`gatsby-plugin-utils`)
  if (isGatsbyNodeLifecycleSupported(`onPluginInit`)) {
    coreSupportsOnPluginInit = `stable`
  } else if (isGatsbyNodeLifecycleSupported(`unstable_onPluginInit`)) {
    coreSupportsOnPluginInit = `unstable`
  }
} catch (e) {
  console.error(`Could not check if Gatsby supports onPluginInit lifecycle`)
}

export function pluginOptionsSchema({ Joi }: PluginOptionsSchemaArgs): any {
  // @ts-ignore TODO: When Gatsby updates Joi version, update type
  // Vague type error that we're not able to figure out related to isJoi missing
  // Probably related to Joi being outdated
  return Joi.object({
    password: Joi.string().required(),
    storeUrl: Joi.string()
      .pattern(/^[a-z0-9-]+\.myshopify\.com$/)
      .message(
        `The storeUrl value should be your store's myshopify.com URL in the form "my-site.myshopify.com", without https or slashes`
      )
      .required(),
    downloadImages: Joi.boolean(),
    typePrefix: Joi.string()
      .pattern(new RegExp(`(^[A-Z]w*)`))
      .message(
        `"typePrefix" can only be alphanumeric characters, starting with an uppercase letter`
      )
      .default(``),
    shopifyConnections: Joi.array()
      .default([])
      .items(Joi.string().valid(`orders`, `collections`, `locations`)),
    salesChannel: Joi.string().default(
      process.env.GATSBY_SHOPIFY_SALES_CHANNEL || ``
    ),
  })
}

async function sourceAllNodes(
  gatsbyApi: SourceNodesArgs,
  pluginOptions: ShopifyPluginOptions
): Promise<void> {
  const {
    createProductsOperation,
    createProductVariantsOperation,
    createOrdersOperation,
    createCollectionsOperation,
    createLocationsOperation,
    finishLastOperation,
    completedOperation,
    cancelOperationInProgress,
  } = createOperations(pluginOptions, gatsbyApi)

  const operations = [createProductsOperation, createProductVariantsOperation]
  if (pluginOptions.shopifyConnections?.includes(`orders`)) {
    operations.push(createOrdersOperation)
  }

  if (pluginOptions.shopifyConnections?.includes(`collections`)) {
    operations.push(createCollectionsOperation)
  }

  if (pluginOptions.shopifyConnections?.includes(`locations`)) {
    operations.push(createLocationsOperation)
  }

  const sourceFromOperation = makeSourceFromOperation(
    finishLastOperation,
    completedOperation,
    cancelOperationInProgress,
    gatsbyApi,
    pluginOptions
  )

  for (const op of operations) {
    await sourceFromOperation(op)
  }
}

const shopifyNodeTypes = [
  `ShopifyLineItem`,
  `ShopifyProductMetafield`,
  `ShopifyProductVariantMetafield`,
  `ShopifyCollectionMetafield`,
  `ShopifyOrder`,
  `ShopifyLocation`,
  `ShopifyInventoryLevel`,
  `ShopifyProduct`,
  `ShopifyCollection`,
  `ShopifyProductImage`,
  `ShopifyCollectionImage`,
  `ShopifyProductFeaturedImage`,
  `ShopifyProductVariant`,
  `ShopifyProductVariantImage`,
  `ShopifyProductVariantPricePair`,
  `ShopifyProductFeaturedMediaPreviewImage`,
]

async function sourceChangedNodes(
  gatsbyApi: SourceNodesArgs,
  pluginOptions: ShopifyPluginOptions
): Promise<void> {
  const {
    incrementalProducts,
    incrementalProductVariants,
    incrementalOrders,
    incrementalCollections,
    incrementalLocations,
    finishLastOperation,
    completedOperation,
    cancelOperationInProgress,
  } = createOperations(pluginOptions, gatsbyApi)
  const { typePrefix = `` } = pluginOptions
  const lastBuildTime = new Date(
    gatsbyApi.store.getState().status.plugins?.[`gatsby-source-shopify`]?.[
      `lastBuildTime${typePrefix}`
    ]
  )

  for (const nodeType of shopifyNodeTypes) {
    gatsbyApi
      .getNodesByType(`${typePrefix}${nodeType}`)
      .forEach(node => gatsbyApi.actions.touchNode(node))
  }

  const operations = [
    incrementalProducts(lastBuildTime),
    incrementalProductVariants(lastBuildTime),
  ]

  if (pluginOptions.shopifyConnections?.includes(`orders`)) {
    operations.push(incrementalOrders(lastBuildTime))
  }

  if (pluginOptions.shopifyConnections?.includes(`collections`)) {
    operations.push(incrementalCollections(lastBuildTime))
  }

  if (pluginOptions.shopifyConnections?.includes(`locations`)) {
    operations.push(incrementalLocations(lastBuildTime))
  }

  const sourceFromOperation = makeSourceFromOperation(
    finishLastOperation,
    completedOperation,
    cancelOperationInProgress,
    gatsbyApi,
    pluginOptions
  )

  for (const op of operations) {
    await sourceFromOperation(op)
  }

  const { fetchDestroyEventsSince } = eventsApi(pluginOptions)
  const destroyEvents = await fetchDestroyEventsSince(lastBuildTime)

  gatsbyApi.reporter.info(
    `${destroyEvents.length} items have been deleted since ${lastBuildTime}`
  )

  if (destroyEvents.length) {
    gatsbyApi.reporter.info(`Removing matching nodes from Gatsby`)
    destroyEvents.forEach(e => {
      const id = `${typePrefix}gid://shopify/${e.subject_type}/${e.subject_id}`
      gatsbyApi.reporter.info(`Looking up node with ID: ${id}`)
      const nodeId = createNodeId(id, gatsbyApi, pluginOptions)
      const node = gatsbyApi.getNode(nodeId)

      if (node) {
        gatsbyApi.reporter.info(
          `Removing ${node.internal.type}: ${node.id} with shopifyId ${e.subject_id}`
        )
        gatsbyApi.actions.deleteNode(node)
      } else {
        gatsbyApi.reporter.info(`Couldn't find node with ID: ${id}`)
      }
    })
  }
}

export async function sourceNodes(
  gatsbyApi: SourceNodesArgs,
  pluginOptions: ShopifyPluginOptions
): Promise<void> {
  const pluginStatus =
    gatsbyApi.store.getState().status.plugins?.[`gatsby-source-shopify`]

  const lastBuildTime =
    pluginStatus?.[`lastBuildTime${pluginOptions.typePrefix || ``}`]

  if (lastBuildTime !== undefined) {
    gatsbyApi.reporter.info(`Cache is warm, running an incremental build`)
    await sourceChangedNodes(gatsbyApi, pluginOptions)
  } else {
    gatsbyApi.reporter.info(`Cache is cold, running a clean build`)
    await sourceAllNodes(gatsbyApi, pluginOptions)
  }

  gatsbyApi.reporter.info(`Finished sourcing nodes, caching last build time`)
  gatsbyApi.actions.setPluginStatus(
    pluginStatus !== undefined
      ? {
          ...pluginStatus,
          [`lastBuildTime${pluginOptions.typePrefix || ``}`]: Date.now(),
        }
      : {
          [`lastBuildTime${pluginOptions.typePrefix || ``}`]: Date.now(),
        }
  )
}

export function createResolvers(
  { createResolvers, cache }: CreateResolversArgs,
  {
    downloadImages,
    typePrefix = ``,
    shopifyConnections = [],
  }: ShopifyPluginOptions
): void {
  if (!downloadImages) {
    const args = {
      placeholder: {
        description: `Low resolution version of the image`,
        type: `String`,
        defaultValue: null,
      } as IGatsbyGraphQLResolverArgumentConfig,
    }
    const imageNodeTypes = [
      `ShopifyProductImage`,
      `ShopifyProductVariantImage`,
      `ShopifyProductFeaturedImage`,
      `ShopifyProductFeaturedMediaPreviewImage`,
    ]

    if (shopifyConnections.includes(`collections`)) {
      imageNodeTypes.push(`ShopifyCollectionImage`)
    }

    const resolvers = imageNodeTypes.reduce((r, nodeType) => {
      return {
        ...r,
        [`${typePrefix}${nodeType}`]: {
          gatsbyImageData: getGatsbyImageResolver(
            makeResolveGatsbyImageData(cache),
            args
          ),
        },
      }
    }, {})

    createResolvers(resolvers)
  }
}

const initializePlugin = ({ reporter }: NodePluginArgs): void => {
  reporter.setErrorMap(ERROR_MAP)
}

if (coreSupportsOnPluginInit === `unstable`) {
  // need to conditionally export otherwise it throws an error for older versions
  exports.unstable_onPluginInit = initializePlugin
} else if (coreSupportsOnPluginInit === `stable`) {
  exports.onPluginInit = initializePlugin
} else {
  exports.onPreInit = initializePlugin
}
