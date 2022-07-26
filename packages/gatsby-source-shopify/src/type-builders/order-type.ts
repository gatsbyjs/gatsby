export function orderTypeBuilder(prefix: string): string {
  return `
      type ${prefix}LineItem implements Node @dontInfer {
        id: ID!
        product: ${prefix}Product @link(from: "product.shopifyId", by: "shopifyId")
        shopifyId: String!
      }

      type ${prefix}Order implements Node @dontInfer {
        closed: Boolean!
        closedAt: Date @dateformat
        edited: Boolean!
        id: ID!
        lineItems: [${prefix}LineItem!]! @link(from: "lineItems___NODE", by: "id")
        refunds: [${prefix}Refund!]!
        shopifyId: String!
      }

      type ${prefix}Refund {
        createdAt: Date @dateformat
        shopifyId: String!
      }
    `
}
