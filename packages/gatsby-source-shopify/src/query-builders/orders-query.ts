import { BulkQuery } from "./bulk-query"

export class OrdersQuery extends BulkQuery {
  query(date?: Date): string {
    const filters = []
    if (date) {
      const isoDate = date.toISOString()
      filters.push(`created_at:>='${isoDate}' OR updated_at:>='${isoDate}'`)
    }

    const queryString = filters.map(f => `(${f})`).join(` AND `)

    const query = `
      {
        orders(query: "${queryString}") {
          edges {
            node {
              closed
              closedAt
              edited
              id
              lineItems {
                edges {
                  node {
                    id
                    product {
                      id
                    }
                  }
                }
              }
              refunds {
                createdAt
                id
              }
            }
          }
        }
      }`

    return this.bulkOperationQuery(query)
  }
}
