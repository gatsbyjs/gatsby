import { BulkQuery } from "./bulk-query"

export class LocationsQuery extends BulkQuery {
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
        locations(query: "${queryString}") {
          edges {
            node {
              id
              activatable
              address {
                address1
                address2
                city
                country
                countryCode
                formatted
                latitude
                longitude
                phone
                province
                provinceCode
                zip
              }
              addressVerified
              deactivatable
              deactivatedAt
              deletable
              fulfillmentService {
                callbackUrl
                fulfillmentOrdersOptIn
                handle
                id
                inventoryManagement
                productBased
                serviceName
                shippingMethods {
                  code
                  label
                }
                type
              }
              fulfillsOnlineOrders
              hasActiveInventory
              hasUnfulfilledOrders
              isActive
              legacyResourceId
              name
              shipsInventory
            }
          }
        }
      }
      `

    return this.bulkOperationQuery(query)
  }
}
