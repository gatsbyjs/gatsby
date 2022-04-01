/*
 * The ProductVariantPricePair object is different than other objects
 * from Shopify because it is an object but doesn't include an id field
 * and for that reason it must be attached directly to the object as opposed
 * to the rest of the objects which are referenced using @link directives.
 */

/*
 * key: The name of the reference field of the node
 * coupled: Whether the node is coupled to another node or top-level
 * optionalKey: The key if the node is optionally included in the plugin options
 * imageFields: An array of fields containing image objects
 * referenceFields: An array defining every field referencing other nodes
 * coupledNodeFields: An array of reference field keys that will be invalidated if that object is
 */

// eslint-disable @typescript-eslint/naming-convention

interface IShopifyTypes {
  [key: string]: {
    key?: string
    coupled: boolean
    optionalKey?: string
    imageFields?: Array<string>
    referenceFields?: Array<string>
    coupledNodeFields?: Array<string>
  }
}

export const shopifyTypes: IShopifyTypes = {
  Collection: {
    key: `collections___NODE`,
    coupled: false,
    optionalKey: `collections`,
    imageFields: [`image`],
    referenceFields: [`products___NODE`, `metafields___NODE`],
    coupledNodeFields: [`metafields___NODE`],
  },
  ExternalVideo: {
    key: `media___NODE`,
    coupled: true,
    imageFields: [`preview.image`],
  },
  InventoryItem: {
    coupled: true,
    referenceFields: [`inventoryLevels___NODE`],
    coupledNodeFields: [`inventoryLevels___NODE`],
  },
  InventoryLevel: {
    key: `inventoryLevels___NODE`,
    coupled: true,
  },
  LineItem: {
    key: `lineItems___NODE`,
    coupled: true,
  },
  Location: {
    coupled: false,
    optionalKey: `locations`,
  },
  Media: {
    coupled: true,
  },
  MediaImage: {
    key: `media___NODE`,
    coupled: true,
    imageFields: [`image`, `preview.image`],
  },
  Metafield: {
    key: `metafields___NODE`,
    coupled: true,
  },
  Model3d: {
    key: `media___NODE`,
    coupled: true,
    imageFields: [`preview.image`],
  },
  Order: {
    coupled: false,
    optionalKey: `orders`,
    referenceFields: [`lineItems___NODE`],
    coupledNodeFields: [`lineItems___NODE`],
  },
  Product: {
    key: `products___NODE`,
    coupled: false,
    imageFields: [`featuredImage`],
    referenceFields: [
      `media___NODE`,
      `variants___NODE`,
      `metafields___NODE`,
      `collections___NODE`,
    ],
    coupledNodeFields: [`media___NODE`, `variants___NODE`, `metafields___NODE`],
  },
  ProductVariant: {
    key: `variants___NODE`,
    coupled: true,
    imageFields: [`image`],
    referenceFields: [
      `inventoryLevels___NODE`,
      `metafields___NODE`,
      `media___NODE`,
    ],
    coupledNodeFields: [
      `inventoryLevels___NODE`,
      `metafields___NODE`,
      `media___NODE`,
    ],
  },
  Video: {
    key: `media___NODE`,
    coupled: true,
    imageFields: [`preview.image`],
  },
  ProductVariantPricePair: {
    key: `presentmentPrices`,
    coupled: true,
  },
}
