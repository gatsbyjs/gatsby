import { BulkQuery } from "./bulk-query"

export class ProductsQuery extends BulkQuery {
  query(date?: Date): string {
    const publishedStatus = this.pluginOptions.salesChannel
      ? `'${encodeURIComponent(this.pluginOptions.salesChannel)}:visible'`
      : `published`;

    const filters = [`status:active`, `published_status:${publishedStatus}`]
    if (date) {
      const isoDate = date.toISOString()
      filters.push(`created_at:>='${isoDate}' OR updated_at:>='${isoDate}'`)
    }

    const ProductImageSortKey = `POSITION`

    const queryString = filters.map(f => `(${f})`).join(` AND `)

    const query = `
      {
        products(query: "${queryString}") {
          edges {
            node {
              id
              storefrontId
              createdAt
              description
              descriptionHtml
              featuredImage {
                id
                altText
                height
                width
                originalSrc
                transformedSrc
              }
              featuredMedia {
                alt
                mediaContentType
                mediaErrors {
                  details
                }
                preview {
                  image {
                    id
                    altText
                    height
                    width
                    originalSrc
                    transformedSrc
                  }
                  status
                }
                status
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
              isGiftCard
              legacyResourceId
              mediaCount
              onlineStorePreviewUrl
              onlineStoreUrl
              options {
                id
                name
                position
                values
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
              sellingPlanGroupCount
              seo {
                description
                title
              }
              status
              tags
              templateSuffix
              title
              totalInventory
              totalVariants
              tracksInventory
              updatedAt
              vendor
              images(sortKey: ${ProductImageSortKey}) {
                edges {
                  node {
                    id
                    altText
                    src
                    originalSrc
                    width
                    height
                  }
                }
              }
              variants {
                edges {
                  node {
                    id
                  }
                }
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
