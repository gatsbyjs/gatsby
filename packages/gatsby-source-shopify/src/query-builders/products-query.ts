import { BulkQuery } from "./bulk-query"

export class ProductsQuery extends BulkQuery {
  query(date?: Date): string {
    const publishedStatus = this.pluginOptions.salesChannel
      ? `'${this.pluginOptions.salesChannel}:visible'`
      : `published`

    const filters = [`status:active`, `published_status:${publishedStatus}`]
    if (date) {
      const isoDate = date.toISOString()
      filters.push(`created_at:>='${isoDate}' OR updated_at:>='${isoDate}'`)
    }

    const queryString = filters.map(f => `(${f})`).join(` AND `)

    const query = `
      {
        products(query: "${queryString}") {
          edges {
            node {
              createdAt
              collections {
                edges {
                  node {
                    id
                  }
                }
              }
              description
              descriptionHtml
              featuredImage {
                altText
                height
                id
                originalSrc
                src
                transformedSrc
                width
              }
              featuredMedia {
                ... on Node {
                  id
                }
              }
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
              giftCardTemplateSuffix
              handle
              hasOnlyDefaultVariant
              hasOutOfStockVariants
              id
              isGiftCard
              legacyResourceId
              media {
                edges {
                  node {
                    alt
                    mediaContentType
                    mediaErrors {
                      code
                      details
                      message
                    }
                    preview {
                      image {
                        altText
                        height
                        id
                        originalSrc
                        src
                        transformedSrc
                        width
                      }
                      status
                    }
                    status
                    ... on ExternalVideo {
                      embeddedUrl
                      host
                      id
                    }
                    ... on MediaImage {
                      createdAt
                      fileErrors {
                        code
                        details
                        message
                      }
                      fileStatus
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
                      mimeType
                    }
                    ... on Model3d {
                      filename
                      id
                      originalSource {
                        filesize
                        format
                        mimeType
                        url
                      }
                      sources {
                        filesize
                        format
                        mimeType
                        url
                      }
                    }
                    ... on Video {
                      filename
                      id
                      originalSource {
                        format
                        height
                        mimeType
                        url
                        width
                      }
                      sources {
                        format
                        height
                        mimeType
                        url
                        width
                      }
                    }
                  }
                }
              }
              mediaCount {
                count
                precision
              }
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
              onlineStorePreviewUrl
              onlineStoreUrl
              options {
                id
                name
                position
                values
              }
              priceRange {
                maxVariantPrice {
                  amount
                  currencyCode
                }
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              priceRangeV2 {
                maxVariantPrice {
                  amount
                  currencyCode
                }
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              productType
              publishedAt
              requiresSellingPlan
              sellingPlanGroupsCount {
                count
                precision
              }
              seo {
                description
                title
              }
              status
              storefrontId
              tags
              templateSuffix
              title
              totalInventory
              totalVariants
              tracksInventory
              updatedAt
              variants {
                edges {
                  node {
                    id
                  }
                }
              }
              vendor
            }
          }
        }
      }
    `

    return this.bulkOperationQuery(query)
  }
}
