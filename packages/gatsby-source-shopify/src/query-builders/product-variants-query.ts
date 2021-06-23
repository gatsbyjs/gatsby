import { BulkQuery } from "./bulk-query"

export class ProductVariantsQuery extends BulkQuery {
  query(date?: Date): string {
    const publishedStatus = this.pluginOptions.salesChannel
      ? encodeURIComponent(`${this.pluginOptions.salesChannel}=visible`)
      : `published`

    const filters = [`status:active`, `published_status:${publishedStatus}`]
    if (date) {
      const isoDate = date.toISOString()
      filters.push(`created_at:>='${isoDate}' OR updated_at:>='${isoDate}'`)
    }

    const ProductVariantSortKey = `POSITION`

    const queryString = filters.map(f => `(${f})`).join(` AND `)

    const query = `
      {
        productVariants(query: "${queryString}", sortKey: ${ProductVariantSortKey}) {
          edges {
            node {
              availableForSale
              barcode
              compareAtPrice
              createdAt
              displayName
	      id
	      product {
		id
	      }
              image {
                id
                altText
                height
                width
                originalSrc
                transformedSrc
              }
              inventoryPolicy
              inventoryQuantity
              legacyResourceId
              position
              price
              selectedOptions {
                name
                value
              }
              sellingPlanGroupCount
              sku
              storefrontId
              taxCode
              taxable
              title
              updatedAt
              weight
              weightUnit
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
                    valueType
                  }
                }
              }
            }
          }
        }
      }
    `

    return this.bulkOperationQuery(query)
  }
}
