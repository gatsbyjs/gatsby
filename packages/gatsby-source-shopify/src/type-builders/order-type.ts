export function orderTypeBuilder(prefix: string): string {
  return `
      type ${prefix}LineItem implements Node @dontInfer {
        _product: String! # Temporary field so we don't break existing users
        id: ID!
        product: ${prefix}Product @link(from: "_product", by: "id")
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
