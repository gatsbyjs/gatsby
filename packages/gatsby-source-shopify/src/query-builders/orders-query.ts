import { BulkQuery } from "./bulk-query";

export class OrdersQuery extends BulkQuery {
  query(date?: Date) {
    const filters = [];
    if (date) {
      const isoDate = date.toISOString();
      filters.push(`created_at:>='${isoDate}' OR updated_at:>='${isoDate}'`);
    }

    const queryString = filters.map((f) => `(${f})`).join(" AND ");

    const query = `
      {
        orders(query: "${queryString}") {
          edges {
            node {
              id
              edited
              closed
              closedAt
              refunds {
                id
                createdAt
              }
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
            }
          }
        }
      }`;

    return this.bulkOperationQuery(query);
  }
}
