export abstract class BulkQuery {
  pluginOptions: ShopifyPluginOptions

  constructor(pluginOptions: ShopifyPluginOptions) {
    this.pluginOptions = pluginOptions

    if (
      process.env.GATSBY_SHOPIFY_SALES_CHANNEL &&
      !this.pluginOptions.salesChannel
    ) {
      this.pluginOptions.salesChannel = process.env.GATSBY_SHOPIFY_SALES_CHANNEL
    }
  }

  abstract query(date?: Date): string

  protected bulkOperationQuery(query: string): string {
    return `
      mutation INITIATE_BULK_OPERATION {
        bulkOperationRunQuery(
        query: """
          ${query}
        """
      ) {
        bulkOperation {
          id
          status
        }
        userErrors {
          field
          message
        }
      }
    }
    `
  }
}
