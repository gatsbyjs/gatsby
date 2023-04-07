export abstract class BulkQuery {
  pluginOptions: IShopifyPluginOptions

  constructor(pluginOptions: IShopifyPluginOptions) {
    this.pluginOptions = pluginOptions
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
