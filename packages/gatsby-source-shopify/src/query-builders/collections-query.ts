import { BulkQuery } from "./bulk-query"

export class CollectionsQuery extends BulkQuery {
  query(date?: Date): string {
    const publishedStatus = this.pluginOptions.salesChannel
      ? `'${encodeURIComponent(this.pluginOptions.salesChannel)}:visible'`
      : `published`

    const filters = [`published_status:${publishedStatus}`]
    if (date) {
      const isoDate = date.toISOString()
      filters.push(`created_at:>='${isoDate}' OR updated_at:>='${isoDate}'`)
    }

    const queryString = filters.map(f => `(${f})`).join(` AND `)

    const query = `
      {
        collections(query: "${queryString}") {
          edges {
            node {
              description
              descriptionHtml
              feedback {
                details {
                  app {
                    id
                  }
                  link {
                    label
                    url
                  }
                  messages {
                    field
                    message
                  }
                }
                summary
              }
              handle
              id
              image {
                altText
                height
                id
                originalSrc
                src
                transformedSrc
                width
              }
              legacyResourceId
              metafields {
                edges {
                  node {
                    createdAt
                    description
                    id
                    key
                    legacyResourceId
                    namespace
                    ownerType
                    updatedAt
                    value
                    type
                    valueType: type
                  }
                }
              }
              products {
                edges {
                  node {
                    id
                  }
                }
              }
              productsCount {
                count
                precision
              }
              ruleSet {
                appliedDisjunctively
                rules {
                  column
                  condition
                  relation
                }
              }
              seo {
                description
                title
              }
              sortOrder
              storefrontId
              templateSuffix
              title
              updatedAt
            }
          }
        }
      }
      `

    return this.bulkOperationQuery(query)
  }
}
