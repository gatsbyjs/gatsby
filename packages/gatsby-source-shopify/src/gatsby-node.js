import { pipe } from "lodash/fp"
import chalk from "chalk"
import { forEach } from "p-iteration"
import isOnline from "is-online"

import { createClient, printGraphQLError, queryAll, queryOnce } from "./lib"
import {
  ArticleNode,
  BlogNode,
  CollectionNode,
  CommentNode,
  ProductNode,
  ProductOptionNode,
  ProductVariantNode,
  ShopPolicyNode,
  ProductTypeNode,
  PageNode,
} from "./nodes"
import {
  ARTICLES_QUERY,
  BLOGS_QUERY,
  COLLECTIONS_QUERY,
  PRODUCTS_QUERY,
  SHOP_POLICIES_QUERY,
  PRODUCT_TYPES_QUERY,
  PAGES_QUERY,
} from "./queries"

export const sourceNodes = async (
  { actions: { createNode, touchNode }, getNodes, createNodeId, store, cache },
  { shopName, accessToken, verbose = true, paginationSize = 250 }
) => {
  // Arguments used for file node creation.
  const imageArgs = { createNode, createNodeId, touchNode, store, cache }

  // Convenience function to namespace console messages.
  const formatMsg = msg =>
    chalk`\n{blue gatsby-source-shopify/${shopName}} ${msg}`

  try {
    const online = await isOnline()
    // if the user sets the GATSBY_SHOPIFY_OFFLINE environment variable
    // force a fall-back to cached nodes, but never in production
    const preferCache =
      process.env.GATSBY_SHOPIFY_OFFLINE === `true` &&
      process.env.NODE_ENV !== `production`

    if (!online || preferCache) {
      console.log(chalk`{bold.red Using offline cache for Shopify} ⚠️`)
      console.log(
        chalk`{bold.red Cache may be invalidated if you edit package.json, gatsby-node.js or gatsby-config.js files}`
      )

      // get all nodes created by this source plugin
      getNodes()
        .filter(n => n.internal.owner === `gatsby-source-shopify`)
        .forEach(node => {
          // touch node to persist in cache
          touchNode({ nodeId: node.id })
          // check for image nodes and touch them to persist in cache
          if (node.image) {
            touchNode({ nodeId: node.image.localFile___NODE })
          }
          if (node.images && node.images.edges) {
            node.images.edges.map(edge => {
              touchNode({ nodeId: edge.node.id })
            })
          }
        })

      // exit early
      return
    }

    const client = createClient(shopName, accessToken)

    console.log(formatMsg(`starting to fetch data from Shopify`))

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

    console.time(msg)
    await Promise.all([
      createNodes(`articles`, ARTICLES_QUERY, ArticleNode, args, async x => {
        if (x.comments)
          await forEach(x.comments.edges, async edge =>
            createNode(await CommentNode(imageArgs)(edge.node))
          )
      }),
      createNodes(`blogs`, BLOGS_QUERY, BlogNode, args),
      createNodes(`collections`, COLLECTIONS_QUERY, CollectionNode, args),
      createNodes(`productTypes`, PRODUCT_TYPES_QUERY, ProductTypeNode, args),
      createNodes(`pages`, PAGES_QUERY, PageNode, args),
      createNodes(`products`, PRODUCTS_QUERY, ProductNode, args, async x => {
        if (x.variants)
          await forEach(x.variants.edges, async edge =>
            createNode(await ProductVariantNode(imageArgs)(edge.node))
          )

        if (x.options)
          await forEach(x.options, async option =>
            createNode(await ProductOptionNode(imageArgs)(option))
          )
      }),
      createShopPolicies(args),
    ])
    console.timeEnd(msg)
  } catch (e) {
    console.error(chalk`\n{red error} an error occured while sourcing data`)

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
  const msg = formatMsg(`fetched and processed ${endpoint}`)

  if (verbose) console.time(msg)
  await forEach(
    await queryAll(client, [`shop`, endpoint], query, paginationSize),
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
  const msg = formatMsg(`fetched and processed policies`)

  if (verbose) console.time(msg)
  const { shop: policies } = await queryOnce(client, SHOP_POLICIES_QUERY)
  Object.entries(policies)
    .filter(([_, policy]) => Boolean(policy))
    .forEach(
      pipe(
        ([type, policy]) => ShopPolicyNode(policy, { type }),
        createNode
      )
    )
  if (verbose) console.timeEnd(msg)
}
