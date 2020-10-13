import createNodeHelpers from "gatsby-node-helpers"
import { map } from "p-iteration"
import { createRemoteFileNode } from "gatsby-source-filesystem"

import {
  TYPE_PREFIX,
  ARTICLE,
  BLOG,
  COLLECTION,
  COMMENT,
  PRODUCT,
  PRODUCT_OPTION,
  PRODUCT_VARIANT,
  PRODUCT_METAFIELD,
  PRODUCT_VARIANT_METAFIELD,
  SHOP_POLICY,
  SHOP_DETAILS,
  PAGE,
} from "./constants"

const { createNodeFactory, generateNodeId } = createNodeHelpers({
  typePrefix: TYPE_PREFIX,
})

const makeId = (id, locale) => `${id}___${locale}`

const createLocaleNode = (node, locale) => {
  return {
    ...node,
    locale,
    id: makeId(node.id, locale),
  }
}

const downloadImageAndCreateFileNode = async (
  { url, nodeId },
  { createNode, createNodeId, touchNode, store, cache, getCache, reporter }
) => {
  let fileNodeID

  const mediaDataCacheKey = `${TYPE_PREFIX}__Media__${url}`
  const cacheMediaData = await cache.get(mediaDataCacheKey)

  if (cacheMediaData) {
    fileNodeID = cacheMediaData.fileNodeID
    touchNode({ nodeId: fileNodeID })
    return fileNodeID
  }

  const fileNode = await createRemoteFileNode({
    url,
    store,
    cache,
    createNode,
    createNodeId,
    getCache,
    parentNodeId: nodeId,
    reporter,
  })

  if (fileNode) {
    fileNodeID = fileNode.id
    await cache.set(mediaDataCacheKey, { fileNodeID })
    return fileNodeID
  }

  return undefined
}

export const ArticleNode = (imageArgs, locale) =>
  createNodeFactory(ARTICLE, async node => {
    if (node.blog)
      node.blog___NODE = generateNodeId(BLOG, makeId(node.blog.id, locale))

    if (node.comments)
      node.comments___NODE = node.comments.edges.map(edge =>
        generateNodeId(COMMENT, makeId(edge.node.id, locale))
      )

    if (node.image)
      node.image.localFile___NODE = await downloadImageAndCreateFileNode(
        { id: node.image.id, url: node.image.src, nodeId: node.id },
        imageArgs
      )

    return createLocaleNode(node, locale)
  })

export const BlogNode = (_imageArgs, locale) =>
  createNodeFactory(BLOG, async node => createLocaleNode(node, locale))

export const CollectionNode = (imageArgs, locale) =>
  createNodeFactory(COLLECTION, async node => {
    if (node.products) {
      node.products___NODE = node.products.edges.map(edge =>
        generateNodeId(PRODUCT, makeId(edge.node.id, locale))
      )
      delete node.products
    }
    if (node.image)
      node.image.localFile___NODE = await downloadImageAndCreateFileNode(
        {
          id: node.image.id,
          url: node.image.src && node.image.src.split(`?`)[0],
          nodeId: node.id,
        },
        imageArgs
      )

    return createLocaleNode(node, locale)
  })

export const CommentNode = (_imageArgs, locale) =>
  createNodeFactory(COMMENT, async node => createLocaleNode(node, locale))

export const ProductNode = (imageArgs, locale) =>
  createNodeFactory(PRODUCT, async node => {
    if (node.variants) {
      const variants = node.variants.edges.map(edge => edge.node)

      node.variants___NODE = variants.map(variant =>
        generateNodeId(PRODUCT_VARIANT, makeId(variant.id, locale))
      )

      delete node.variants
    }

    if (node.metafields) {
      const metafields = node.metafields.edges.map(edge => edge.node)

      node.metafields___NODE = metafields.map(metafield =>
        generateNodeId(PRODUCT_METAFIELD, makeId(metafield.id, locale))
      )
      delete node.metafields
    }

    if (node.options) {
      node.options___NODE = node.options.map(option =>
        generateNodeId(PRODUCT_OPTION, makeId(option.id, locale))
      )
      delete node.options
    }

    if (node.images && node.images.edges)
      node.images = await map(node.images.edges, async edge => {
        edge.node.localFile___NODE = await downloadImageAndCreateFileNode(
          {
            id: edge.node.id,
            url: edge.node.originalSrc && edge.node.originalSrc.split(`?`)[0],
          },
          imageArgs
        )
        return edge.node
      })

    return createLocaleNode(node, locale)
  })

export const ProductMetafieldNode = (_imageArgs, locale) =>
  createNodeFactory(PRODUCT_METAFIELD, async node =>
    createLocaleNode(node, locale)
  )

export const ProductOptionNode = (_imageArgs, locale) =>
  createNodeFactory(PRODUCT_OPTION, async node =>
    createLocaleNode(node, locale)
  )

export const ProductVariantNode = (imageArgs, productNode, locale) =>
  createNodeFactory(PRODUCT_VARIANT, async node => {
    if (node.metafields) {
      const metafields = node.metafields.edges.map(edge => edge.node)

      node.metafields___NODE = metafields.map(metafield =>
        generateNodeId(PRODUCT_VARIANT_METAFIELD, makeId(metafield.id, locale))
      )
      delete node.metafields
    }

    if (node.image)
      node.image.localFile___NODE = await downloadImageAndCreateFileNode(
        {
          id: node.image.id,
          url: node.image.originalSrc && node.image.originalSrc.split(`?`)[0],
        },
        imageArgs
      )

    node.product___NODE = productNode.id

    return createLocaleNode(node, locale)
  })

export const ProductVariantMetafieldNode = (_imageArgs, locale) =>
  createNodeFactory(PRODUCT_VARIANT_METAFIELD, async node =>
    createLocaleNode(node, locale)
  )

export const ShopPolicyNode = (locale, type) =>
  createNodeFactory(SHOP_POLICY, async node => {
    return {
      ...createLocaleNode(node, locale),
      type,
    }
  })

export const ShopDetailsNode = locale =>
  createNodeFactory(SHOP_DETAILS, async node => createLocaleNode(node, locale))

export const PageNode = locale =>
  createNodeFactory(PAGE, async node => createLocaleNode(node, locale))
