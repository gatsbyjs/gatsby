import { pipe } from "lodash/fp"
import chalk from "chalk"
import { forEach } from "p-iteration"
import { printGraphQLError, queryAll, queryOnce } from "./lib"
import { createClient } from "./create-client"

import {
  ArticleNode,
  BlogNode,
  CollectionNode,
  CommentNode,
  ProductNode,
  ProductOptionNode,
  ProductVariantNode,
  ProductMetafieldNode,
  ShopPolicyNode,
  PageNode,
} from "./nodes"
import {
  SHOP,
  CONTENT,
  NODE_TO_ENDPOINT_MAPPING,
  ARTICLE,
  BLOG,
  COLLECTION,
  PRODUCT,
  SHOP_POLICY,
  PAGE,
} from "./constants"
import {
  ARTICLES_QUERY,
  BLOGS_QUERY,
  COLLECTIONS_QUERY,
  PRODUCTS_QUERY,
  SHOP_POLICIES_QUERY,
  PAGES_QUERY,
} from "./queries"

export const sourceNodes = async (
  { actions: { createNode, touchNode }, createNodeId, store, cache, reporter },
  {
    shopName,
    accessToken,
    verbose = true,
    paginationSize = 250,
    includeCollections = [SHOP, CONTENT],
  }
) => {
  const client = createClient(shopName, accessToken)

  // Convenience function to namespace console messages.
  const formatMsg = msg =>
    chalk`\n{blue gatsby-source-shopify/${shopName}} ${msg}`

  try {
    console.log(formatMsg(`starting to fetch data from Shopify`))

    // Arguments used for file node creation.
    const imageArgs = {
      createNode,
      createNodeId,
      touchNode,
      store,
      cache,
      reporter,
    }

    // Arguments used for node creation.
    const args = {
      client,
      createNode,
      createNodeId,
      formatMsg,
      verbose,
      imageArgs,
      paginationSize,
    }

    // Message printed when fetching is complete.
    const msg = formatMsg(`finished fetching data from Shopify`)

    let promises = []
    if (includeCollections.includes(SHOP)) {
      promises = promises.concat([
        createNodes(COLLECTION, COLLECTIONS_QUERY, CollectionNode, args),
        createNodes(PRODUCT, PRODUCTS_QUERY, ProductNode, args, async x => {
          if (x.variants)
            await forEach(x.variants.edges, async edge =>
              createNode(await ProductVariantNode(imageArgs)(edge.node))
            )

          if (x.metafields)
            await forEach(x.metafields.edges, async edge =>
              createNode(await ProductMetafieldNode(imageArgs)(edge.node))
            )

          if (x.options)
            await forEach(x.options, async option =>
              createNode(await ProductOptionNode(imageArgs)(option))
            )
        }),
        createShopPolicies(args),
      ])
    }
    if (includeCollections.includes(CONTENT)) {
      promises = promises.concat([
        createNodes(BLOG, BLOGS_QUERY, BlogNode, args),
        createNodes(ARTICLE, ARTICLES_QUERY, ArticleNode, args, async x => {
          if (x.comments)
            await forEach(x.comments.edges, async edge =>
              createNode(await CommentNode(imageArgs)(edge.node))
            )
        }),
        createPageNodes(PAGE, PAGES_QUERY, PageNode, args),
      ])
    }

    console.time(msg)
    await Promise.all(promises)
    console.timeEnd(msg)
  } catch (e) {
    console.error(chalk`\n{red error} an error occurred while sourcing data`)

    // If not a GraphQL request error, let Gatsby print the error.
    if (!e.hasOwnProperty(`request`)) throw e

    printGraphQLError(e)
  }
}

/**
 * Fetch and create nodes for the provided endpoint, query, and node factory.
 */
const createNodes = async (
  endpoint,
  query,
  nodeFactory,
  { client, createNode, formatMsg, verbose, imageArgs, paginationSize },
  f = async () => {}
) => {
  // Message printed when fetching is complete.
  const msg = formatMsg(`fetched and processed ${endpoint} nodes`)

  if (verbose) console.time(msg)
  await forEach(
    await queryAll(
      client,
      [`shop`, NODE_TO_ENDPOINT_MAPPING[endpoint]],
      query,
      paginationSize
    ),
    async entity => {
      const node = await nodeFactory(imageArgs)(entity)
      createNode(node)
      await f(entity)
    }
  )
  if (verbose) console.timeEnd(msg)
}

/**
 * Fetch and create nodes for shop policies.
 */
const createShopPolicies = async ({
  client,
  createNode,
  formatMsg,
  verbose,
}) => {
  // Message printed when fetching is complete.
  const msg = formatMsg(`fetched and processed ${SHOP_POLICY} nodes`)

  if (verbose) console.time(msg)
  const { shop: policies } = await queryOnce(client, SHOP_POLICIES_QUERY)
  Object.entries(policies)
    .filter(([_, policy]) => Boolean(policy))
    .forEach(
      pipe(([type, policy]) => ShopPolicyNode(policy, { type }), createNode)
    )
  if (verbose) console.timeEnd(msg)
}

const createPageNodes = async (
  endpoint,
  query,
  nodeFactory,
  { client, createNode, formatMsg, verbose, paginationSize },
  f = async () => {}
) => {
  // Message printed when fetching is complete.
  const msg = formatMsg(`fetched and processed ${endpoint} nodes`)

  if (verbose) console.time(msg)
  await forEach(
    await queryAll(client, [endpoint], query, paginationSize),
    async entity => {
      const node = await nodeFactory(entity)
      createNode(node)
      await f(entity)
    }
  )
  if (verbose) console.timeEnd(msg)
}
