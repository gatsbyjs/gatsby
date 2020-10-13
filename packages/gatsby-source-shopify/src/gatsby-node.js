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
  ProductVariantMetafieldNode,
  ShopPolicyNode,
  ShopDetailsNode,
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
  SHOP_DETAILS,
  PAGE,
} from "./constants"
import {
  ARTICLES_QUERY,
  BLOGS_QUERY,
  COLLECTIONS_QUERY,
  PRODUCTS_QUERY,
  SHOP_POLICIES_QUERY,
  SHOP_DETAILS_QUERY,
  PAGES_QUERY,
} from "./queries"

export const sourceNodes = async (
  {
    actions: { createNode, touchNode },
    createNodeId,
    store,
    cache,
    getCache,
    reporter,
  },
  {
    shopName,
    accessToken,
    apiVersion = `2020-07`,
    verbose = true,
    paginationSize = 250,
    languages = [`en`],
    includeCollections = [SHOP, CONTENT],
    shopifyQueries = {},
  }
) => {
  const client = locale =>
    createClient(shopName, accessToken, apiVersion, locale)

  const defaultQueries = {
    articles: ARTICLES_QUERY,
    blogs: BLOGS_QUERY,
    collections: COLLECTIONS_QUERY,
    products: PRODUCTS_QUERY,
    shopPolicies: SHOP_POLICIES_QUERY,
    shopDetails: SHOP_DETAILS_QUERY,
    pages: PAGES_QUERY,
  }

  const queries = { ...defaultQueries, ...shopifyQueries }

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
      getCache,
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
      queries,
      languages,
    }

    // Message printed when fetching is complete.
    const msg = formatMsg(`finished fetching data from Shopify`)

    let promises = []
    if (includeCollections.includes(SHOP)) {
      promises = promises.concat([
        createNodes(COLLECTION, queries.collections, CollectionNode, args),
        createNodes(
          PRODUCT,
          queries.products,
          ProductNode,
          args,
          async (product, productNode, locale) => {
            if (product.variants)
              await forEach(product.variants.edges, async edge => {
                const v = edge.node
                if (v.metafields)
                  await forEach(v.metafields.edges, async edge =>
                    createNode(
                      await ProductVariantMetafieldNode(
                        imageArgs,
                        locale
                      )(edge.node)
                    )
                  )

                return createNode(
                  await ProductVariantNode(
                    imageArgs,
                    productNode,
                    locale
                  )(edge.node)
                )
              })

            if (product.metafields)
              await forEach(product.metafields.edges, async edge =>
                createNode(
                  await ProductMetafieldNode(imageArgs, locale)(edge.node)
                )
              )

            if (product.options)
              await forEach(product.options, async option =>
                createNode(await ProductOptionNode(imageArgs, locale)(option))
              )
          }
        ),
        createShopPolicies(args),
        createShopDetails(args),
      ])
    }
    if (includeCollections.includes(CONTENT)) {
      promises = promises.concat([
        createNodes(BLOG, queries.blogs, BlogNode, args),
        createNodes(
          ARTICLE,
          queries.articles,
          ArticleNode,
          args,
          async (article, _, locale) => {
            if (article.comments)
              await forEach(article.comments.edges, async edge =>
                createNode(await CommentNode(imageArgs, locale)(edge.node))
              )
          }
        ),
        createPageNodes(PAGE, queries.pages, PageNode, args),
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
// createNodes(COLLECTION, queries.collections, CollectionNode, args),
const createNodes = async (
  endpoint,
  query,
  nodeFactory,
  {
    client,
    createNode,
    formatMsg,
    verbose,
    imageArgs,
    paginationSize,
    languages,
  },
  f = async () => {}
) => {
  // Message printed when fetching is complete.
  const msg = formatMsg(`fetched and processed ${endpoint} nodes`)

  if (verbose) console.time(msg)
  await forEach(
    languages,
    async locale =>
      await forEach(
        await queryAll(
          client(locale),
          [NODE_TO_ENDPOINT_MAPPING[endpoint]],
          query,
          paginationSize
        ),
        async entity => {
          const node = await nodeFactory(imageArgs, locale)(entity)
          createNode(node)
          await f(entity, node, locale)
        }
      )
  )
  if (verbose) console.timeEnd(msg)
}

/**
 * Fetch and create nodes for shop policies.
 */
const createShopDetails = async ({
  client,
  createNode,
  formatMsg,
  verbose,
  queries,
  languages,
}) => {
  // // Message printed when fetching is complete.
  const msg = formatMsg(`fetched and processed ${SHOP_DETAILS} nodes`)

  if (verbose) console.time(msg)
  await forEach(languages, async locale => {
    const { shop } = await queryOnce(client(locale), queries.shopDetails)
    const node = await ShopDetailsNode(locale)(shop)
    createNode(node)
  })
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
  queries,
  languages,
}) => {
  // Message printed when fetching is complete.
  const msg = formatMsg(`fetched and processed ${SHOP_POLICY} nodes`)

  if (verbose) console.time(msg)
  await forEach(languages, async locale => {
    const { shop: policies } = await queryOnce(
      client(locale),
      queries.shopPolicies
    )

    Object.entries(policies)
      .filter(([_, policy]) => Boolean(policy))
      .forEach(
        pipe(async ([type, policy]) => {
          const node = await ShopPolicyNode(locale, type)(policy)
          createNode(node)
        })
      )
  })
  if (verbose) console.timeEnd(msg)
}

const createPageNodes = async (
  endpoint,
  query,
  nodeFactory,
  { client, createNode, formatMsg, verbose, paginationSize, languages },
  f = async () => {}
) => {
  // Message printed when fetching is complete.
  const msg = formatMsg(`fetched and processed ${endpoint} nodes`)

  if (verbose) console.time(msg)
  await forEach(languages, async locale => {
    await forEach(
      await queryAll(
        client(locale),
        [NODE_TO_ENDPOINT_MAPPING[endpoint]],
        query,
        paginationSize
      ),
      async entity => {
        const node = await nodeFactory(locale)(entity)
        createNode(node)
        await f(entity)
      }
    )
  })
  if (verbose) console.timeEnd(msg)
}
