export function collectionTypeBuilder(prefix: string): string {
  return `
      type ${prefix}Collection implements Node @dontInfer {
        description: String!
        descriptionHtml: String!
        feedback: ${prefix}ResourceFeedback
        handle: String!
        id: ID!
        image: ${prefix}Image
        legacyResourceId: String!
        metafield(namespace: String! key: String!): ${prefix}Metafield
        metafields: [${prefix}Metafield!]! @link(from: "metafields___NODE", by: "id")
        products: [${prefix}Product!]! @link(from: "products___NODE", by: "id")
        productsCount: Int! @proxy(from: "productsCount.count")
        ruleSet: ${prefix}CollectionRuleSet
        seo: ${prefix}SEO!
        shopifyId: String!
        sortOrder: ${prefix}CollectionSortOrder!
        storefrontId: String!
        templateSuffix: String
        title: String!
        updatedAt: Date! @dateformat
      }

      type ${prefix}CollectionRule {
        column: ${prefix}CollectionRuleColumn!
        condition: String!
        relation: ${prefix}CollectionRuleRelation!
      }

      enum ${prefix}CollectionRuleColumn {
        TAG
        TITLE
        TYPE
        VENDOR
        VARIANT_PRICE
        IS_PRICE_REDUCED
        VARIANT_COMPARE_AT_PRICE
        VARIANT_WEIGHT
        VARIANT_INVENTORY
        VARIANT_TITLE
      }

      enum ${prefix}CollectionRuleRelation {
        CONTAINS
        ENDS_WITH
        EQUALS
        GREATER_THAN
        IS_NOT_SET
        IS_SET
        LESS_THAN
        NOT_CONTAINS
        NOT_EQUALS
        STARTS_WITH
      }

      type ${prefix}CollectionRuleSet {
        appliedDisjunctively: Boolean!
        rules: [${prefix}CollectionRule!]!
      }

      enum ${prefix}CollectionSortOrder {
        ALPHA_ASC
        ALPHA_DESC
        BEST_SELLING
        CREATED
        CREATED_DESC
        MANUAL
        PRICE_ASC
        PRICE_DESC
      }

      extend type ${prefix}Product {
        collections: [${prefix}Collection!]! @link(from: "collections___NODE", by: "id")
      }
    `
}
