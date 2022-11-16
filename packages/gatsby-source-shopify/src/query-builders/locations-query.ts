import { BulkQuery } from "./bulk-query"

/*
 * TODO - Add 'locations.edges.node.fulfillmentService.callbackUrl'.
 * As of 2021-11-18 this field, when queried against a legacy location
 * will cause an error. We have notified Shopify and will return this field
 * once the issue is resolved.
 */
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
        locations(includeInactive: true, includeLegacy: true, query: "${queryString}") {
          edges {
            node {
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
              id
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
