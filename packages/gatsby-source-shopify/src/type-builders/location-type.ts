export function locationTypeBuilder(prefix: string): string {
  return `
      type ${prefix}FulfillmentService {
        callbackUrl: String
        fulfillmentOrdersOptIn: Boolean!
        handle: String!
        inventoryManagement: Boolean!
        productBased: Boolean! @deprecated(reason: "\`productBased\` will be removed in version 2024-07, non-product based fulfillment services are no longer supported")
        serviceName: String!
        shippingMethods: [${prefix}ShippingMethod!]!
        shopifyId: String!
        type: ${prefix}FulfillmentServiceType!
      }

      enum ${prefix}FulfillmentServiceType {
        GIFT_CARD
        MANUAL
        THIRD_PARTY
      }

      type ${prefix}InventoryItem {
        countryCodeOfOrigin: ${prefix}CountryCode
        createdAt: Date! @dateformat
        duplicateSkuCount: Int!
        harmonizedSystemCode: String
        inventoryHistoryUrl: String
        inventoryLevels: [${prefix}InventoryLevel!]! @link(by: "id") @proxy(from: "inventoryLevels___NODE", fromNode: true)
        legacyResourceId: String!
        locationsCount: Int! @proxy(from: "locationsCount.count")
        provinceCodeOfOrigin: String
        requiresShipping: Boolean!
        shopifyId: String!
        sku: String
        tracked: Boolean!
        trackedEditable: ${prefix}EditableProperty!
        unitCost: ${prefix}MoneyV2
        updatedAt: Date! @dateformat
        variant: ${prefix}ProductVariantConnection!
      }

      type ${prefix}InventoryQuantity {
        name: String!
        quantity: Int!
      }

      type ${prefix}InventoryLevel implements Node @dontInfer {
        _location: String! # Temporary field so we don't break existing users
        quantities: [${prefix}InventoryQuantity!]!
        available: Int! @proxy(from: "quantities") @selectQuantityByName(name: "available")
        incoming: Int! @proxy(from: "quantities") @selectQuantityByName(name: "incoming")
        committed: Int! @proxy(from: "quantities") @selectQuantityByName(name: "committed")
        reserved: Int! @proxy(from: "quantities") @selectQuantityByName(name: "reserved")
        damaged: Int! @proxy(from: "quantities") @selectQuantityByName(name: "damaged")
        safety_stock: Int! @proxy(from: "quantities") @selectQuantityByName(name: "safety_stock")
        quality_control: Int! @proxy(from: "quantities") @selectQuantityByName(name: "quality_control")
        id: ID!
        location: ${prefix}Location! @link(from: "_location", by: "id")
        shopifyId: String!
      }

      type ${prefix}Location implements Node @dontInfer {
        activatable: Boolean!
        address: ${prefix}LocationAddress!
        addressVerified: Boolean!
        deactivatable: Boolean!
        deactivatedAt: String
        deletable: Boolean!
        fulfillmentService: ${prefix}FulfillmentService
        fulfillsOnlineOrders: Boolean!
        hasActiveInventory: Boolean!
        hasUnfulfilledOrders: Boolean!
        id: ID!
        isActive: Boolean!
        legacyResourceId: String!
        name: String!
        shipsInventory: Boolean!
        shopifyId: String!
      }

      type ${prefix}LocationAddress {
        address1: String
        address2: String
        city: String
        country: String
        countryCode: String
        formatted: [String!]!
        latitude: Float
        longitude: Float
        phone: String
        province: String
        provinceCode: String
        zip: String
      }

      type ${prefix}ShippingMethod {
        code: String!
        label: String!
      }

      extend type ${prefix}ProductVariant {
        inventoryItem: ${prefix}InventoryItem!
      }
    `
}
