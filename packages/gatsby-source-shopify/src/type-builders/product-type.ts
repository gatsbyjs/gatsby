export function productTypeBuilder(prefix: string): string {
  return `
      type ${prefix}Product implements Node @dontInfer {
        createdAt: Date!
        description: String!
        descriptionHtml: String!
        featuredImage: ${prefix}Image
        featuredMedia: ${prefix}Media @link(from: "featuredMedia.id", by: "shopifyId")
        feedback: ${prefix}ResourceFeedback
        giftCardTemplateSuffix: String
        handle: String!
        hasOnlyDefaultVariant: Boolean!
        hasOutOfStockVariants: Boolean!
        id: ID!
        isGiftCard: Boolean!
        legacyResourceId: String!
        media: [${prefix}Media!]! @link(from: "media___NODE", by: "id")
        mediaCount: Int!
        metafields: [${prefix}Metafield!]! @link(from: "metafields___NODE", by: "id")
        onlineStorePreviewUrl: String
        onlineStoreUrl: String
        options: [${prefix}ProductOption!]!
        priceRange: ${prefix}ProductPriceRange! @deprecated(reason: "Deprecated in API version 2020-10. Use \`priceRangeV2\` instead.")
        priceRangeV2: ${prefix}ProductPriceRangeV2!
        productType: String!
        publishedAt: Date
        requiresSellingPlan: Boolean!
        sellingPlanGroupCount: Int!
        seo: ${prefix}SEO!
        shopifyId: String!
        status: ${prefix}ProductStatus!
        storefrontId: String!
        tags: [String!]!
        templateSuffix: String
        title: String!
        totalInventory: Int!
        totalVariants: Int!
        tracksInventory: Boolean!
        updatedAt: Date!
        variants: [${prefix}ProductVariant!]! @link(from: "variants___NODE", by: "id")
        vendor: String!
      }

      type ${prefix}ProductOption {
        id: ID!
        name: String!
        position: Int!
        values: [String!]!
      }

      type ${prefix}ProductPriceRange {
        maxVariantPrice: ${prefix}MoneyV2!
        minVariantPrice: ${prefix}MoneyV2!
      }

      type ${prefix}ProductPriceRangeV2 {
        maxVariantPrice: ${prefix}MoneyV2!
        minVariantPrice: ${prefix}MoneyV2!
      }

      enum ${prefix}ProductStatus {
        ACTIVE
        ARCHIVED
        DRAFT
      }
    `
}
