// Node prefix
export const TYPE_PREFIX = `Shopify`

// Node types
export const ARTICLE = `Article`
export const BLOG = `Blog`
export const COLLECTION = `Collection`
export const COMMENT = `Comment`
export const PRODUCT = `Product`
export const PRODUCT_OPTION = `ProductOption`
export const PRODUCT_VARIANT = `ProductVariant`
export const PRODUCT_METAFIELD = `ProductMetafield`
export const SHOP_POLICY = `ShopPolicy`
export const PRODUCT_TYPE = `ProductType`
export const PAGE = `Page`
export const SHOP = `shop`
export const CONTENT = `content`

export const NODE_TO_ENDPOINT_MAPPING = {
  [ARTICLE]: `articles`,
  [BLOG]: `blogs`,
  [COLLECTION]: `collections`,
  [PRODUCT]: `products`,
  [PRODUCT_TYPE]: `productTypes`,
  [PAGE]: `pages`,
}
