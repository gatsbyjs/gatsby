export function metafieldTypeBuilder(prefix: string): string {
  return `
      type ${prefix}Metafield implements Node @dontInfer {
        createdAt: Date! @dateformat
        description: String
        id: ID!
        key: String!
        legacyResourceId: String!
        namespace: String!
        ownerType: ${prefix}MetafieldOwnerType!
        shopifyId: String!
        type: String!
        updatedAt: Date! @dateformat
        value: String!
        valueType: String! @deprecated(reason: "\`valueType\` is deprecated and replaced by \`type\` in API version 2021-07.")
      }

      enum ${prefix}MetafieldOwnerType {
        ARTICLE
        BLOG
        COLLECTION
        CUSTOMER
        DRAFTORDER
        ORDER
        PAGE
        PRODUCT
        PRODUCTIMAGE
        PRODUCTVARIANT
        SHOP
      }
    `
}
