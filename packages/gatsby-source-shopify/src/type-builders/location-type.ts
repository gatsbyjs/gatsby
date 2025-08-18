export function locationTypeBuilder(prefix: string): string {
  return `
      type ${prefix}FulfillmentService {
        callbackUrl: String
        fulfillmentOrdersOptIn: Boolean! @deprecated(reason: "Property is always set to true on correctly functioning fulfillment services.")
        handle: String!
        inventoryManagement: Boolean!
        serviceName: String!
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
        measurement: ${prefix}InventoryItemMeasurement!
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

      type ${prefix}InventoryItemMeasurement {
        weight: ${prefix}Weight
      }

      type ${prefix}InventoryQuantity {
        name: String!
        quantity: Int!
      }

      type ${prefix}InventoryLevel implements Node @dontInfer {
        _location: String! # Temporary field so we don't break existing users
        quantities: [${prefix}InventoryQuantity!]!
        available: Int! @proxy(from: "quantities") @selectQuantityByName(name: "available") @deprecated(reason: "Query \`quantities\` field directly")
        incoming: Int! @proxy(from: "quantities") @selectQuantityByName(name: "incoming") @deprecated(reason: "Query \`quantities\` field directly")
        committed: Int! @proxy(from: "quantities") @selectQuantityByName(name: "committed") @deprecated(reason: "Query \`quantities\` field directly")
        reserved: Int! @proxy(from: "quantities") @selectQuantityByName(name: "reserved") @deprecated(reason: "Query \`quantities\` field directly")
        damaged: Int! @proxy(from: "quantities") @selectQuantityByName(name: "damaged") @deprecated(reason: "Query \`quantities\` field directly")
        safety_stock: Int! @proxy(from: "quantities") @selectQuantityByName(name: "safety_stock") @deprecated(reason: "Query \`quantities\` field directly")
        quality_control: Int! @proxy(from: "quantities") @selectQuantityByName(name: "quality_control") @deprecated(reason: "Query \`quantities\` field directly")
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

      type ${prefix}Weight {
        unit: ${prefix}WeightUnit!
        value: Float!
      }

      extend type ${prefix}ProductVariant {
        inventoryItem: ${prefix}InventoryItem!
        weight: Float @proxy(from: "inventoryItem.measurement.weight.value") @deprecated(reason: "Query \`inventoryItem.measurement.weight.value\` directly")
        weightUnit: ${prefix}WeightUnit! @proxy(from: "inventoryItem.measurement.weight.unit") @deprecated(reason: "Query \`inventoryItem.measurement.weight.unit\` directly")
      }
    `
}
