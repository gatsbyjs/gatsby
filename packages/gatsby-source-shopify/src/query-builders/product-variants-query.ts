import { BulkQuery } from "./bulk-query"

export class ProductVariantsQuery extends BulkQuery {
  query(date?: Date): string {
    const publishedStatus = this.pluginOptions.salesChannel
      ? `'${encodeURIComponent(this.pluginOptions.salesChannel)}:visible'`
      : `published`

    const filters = [`status:active`, `published_status:${publishedStatus}`]
    if (date) {
      const isoDate = date.toISOString()
      filters.push(`created_at:>='${isoDate}' OR updated_at:>='${isoDate}'`)
    }

    const includeLocations =
      !!this.pluginOptions.shopifyConnections?.includes(`locations`)

    const queryString = filters.map(f => `(${f})`).join(` AND `)

    const query = `
      {
        productVariants(query: "${queryString}") {
          edges {
            node {
              availableForSale
              barcode
              compareAtPrice
              createdAt
              displayName
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
              inventoryItem @include(if: ${includeLocations}) {
                countryCodeOfOrigin
                createdAt
                duplicateSkuCount
                harmonizedSystemCode
                id
                inventoryHistoryUrl
                inventoryLevels {
                  edges {
                    node {
                      quantities(names: ["incoming", "available", "committed", "reserved", "damaged", "safety_stock", "quality_control"]) {
                        name
                        quantity
                      }
                      id
                      location {
                        id
                      }
                    }
                  }
                }
                legacyResourceId
                locationsCount {
                  count
                  precision
                }
                provinceCodeOfOrigin
                requiresShipping
                sku
                tracked
                trackedEditable {
                  locked
                  reason
                }
                unitCost {
                  amount
                  currencyCode
                }
                updatedAt
                variant {
                  id
                }
              }
              inventoryPolicy
              inventoryQuantity
              legacyResourceId
              media {
                edges {
                  node {
                    ... on Node {
                      id
                    }
                  }
                }
              }
              position
              presentmentPrices {
                edges {
                  node {
                    compareAtPrice {
                      amount
                      currencyCode
                    }
                    price {
                      amount
                      currencyCode
                    }
                    __typename
                  }
                }
              }
              price
              product {
                id
              }
              requiresShipping
              selectedOptions {
                name
                value
              }
              sellingPlanGroupsCount {
                count
                precision
              }
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
                    type
                    updatedAt
                    value
                    valueType: type
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
