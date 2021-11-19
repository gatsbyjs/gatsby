/*
 * The ProductVariantPricePair object is different than other objects
 * from Shopify because it is an object but doesn't include an id field
 * and for that reason it must be attached directly to the object as opposed
 * to the rest of the objects which are referenced using @link directives.
*/

/*
 * key: The name of the reference field of the node
 * fields: An object defining the defaults for reference fields
 * coupledNodeFields: An array of reference field keys that will be invalidated if that object is
*/

interface ShopifyTypes {
  [key: string]: {
    key?: string
    fields?: {
      [key: string]: []
    }
    imageFields?: string[]
    coupledNodeFields?: string[]
  }
}

export const shopifyTypes: ShopifyTypes = {
  Collection: {
    key: "collections___NODE",
    fields: { products___NODE: [], metafields___NODE: [] },
    coupledNodeFields: ["metafields___NODE"],
    imageFields: ['image'],
  },
  ExternalVideo: { key: "media___NODE", imageFields: ['preview.image'] },
  InventoryItem: { fields: { inventoryLevels___NODE: [] } },
  InventoryLevel: { key: "inventoryLevels___NODE" },
  LineItem: { key: "lineItems___NODE" },
  Location: {},
  Media: {},
  MediaImage: { key: "media___NODE", imageFields: ['image', 'preview.image'] },
  Metafield: { key: "metafields___NODE" },
  Model3d: { key: "media___NODE", imageFields: ['preview.image'] },
  Order: { fields: { lineItems___NODE: [] } },
  Product: {
    key: "products___NODE",
    fields: {
      media___NODE: [],
      variants___NODE: [],
      metafields___NODE: [],
      collections___NODE: [],
    },
    imageFields: ['featuredImage'],
    coupledNodeFields: ['media___NODE', 'metafields___NODE', 'variants___NODE'],
  },
  ProductVariant: {
    key: "variants___NODE",
    fields: { metafields___NODE: [],  },
    imageFields: ['image'],
    coupledNodeFields: ['InventoryLevel', 'Metafield'],
  },
  Video: { key: "media___NODE", imageFields: ['preview.image'] },
  ProductVariantPricePair: { key: "presentmentPrices" },
}
