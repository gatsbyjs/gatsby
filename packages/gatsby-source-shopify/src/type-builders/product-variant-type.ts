export function productVariantTypeBuilder(prefix: string): string {
  return `
      type ${prefix}ProductVariant implements Node @dontInfer {
        _product: String! # Temporary field so we don't break existing users
        availableForSale: Boolean!
        barcode: String
        compareAtPrice: Float
        createdAt: Date! @dateformat
        displayName: String!
        id: ID!
        image: ${prefix}Image
        inventoryPolicy: ${prefix}ProductVariantInventoryPolicy!
        inventoryQuantity: Int
        legacyResourceId: String!
        media: [${prefix}Media!]! @link(from: "media___NODE", by: "id")
        metafield(namespace: String! key: String!): ${prefix}Metafield
        metafields: [${prefix}Metafield!]! @link(from: "metafields___NODE", by: "id")
        position: Int!
        presentmentPrices: [${prefix}ProductVariantPricePair!]!
        price: Float!
        product: ${prefix}Product! @link(from: "_product", by: "id")
        requiresShipping: Boolean! @deprecated(reason: "Use \`InventoryItem.requiresShipping\` instead.")
        selectedOptions: [${prefix}SelectedOption!]!
        sellingPlanGroupCount: Int! @proxy(from: "sellingPlanGroupsCount.count")
        sku: String
        shopifyId: String!
        storefrontId: String!
        taxCode: String
        taxable: Boolean!
        title: String!
        updatedAt: Date! @dateformat
        weight: Float
        weightUnit: ${prefix}WeightUnit!
      }

      enum ${prefix}ProductVariantInventoryPolicy {
        DENY
        CONTINUE
      }

      type ${prefix}ProductVariantPricePair {
        compareAtPrice: ${prefix}MoneyV2
        price: ${prefix}MoneyV2!
      }

      type ${prefix}SelectedOption {
        name: String!
        value: String!
      }
    `
}
