export function orderTypeBuilder(prefix: String) {
    return `
      type ${prefix}LineItem implements Node @dontInfer {
        id: ID!
        product: ${prefix}Product @link(from: "product.id", by: "shopifyId")
        shopifyId: String!
      }

      type ${prefix}Order implements Node @dontInfer {
        closed: Boolean!
        closedAt: Date
        edited: Boolean!
        id: ID!
        lineItems: [${prefix}LineItem!]! @link(from: "lineItems___NODE", by: "id")
        refunds: [${prefix}Refund!]!
        shopifyId: String!
      }

      type ${prefix}Refund {
        createdAt: Date
        id: ID!
      }
    `;
}
