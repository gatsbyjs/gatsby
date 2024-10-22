import { PluginOptionsSchemaArgs } from "gatsby"

export function pluginOptionsSchema({ Joi }: PluginOptionsSchemaArgs): unknown {
  return Joi.object({
    storeUrl: Joi.string()
      .pattern(/^[a-z0-9-]+\.myshopify\.com$/)
      .message(
        `The storeUrl value should be your store's myshopify.com URL in the form "my-unique-store-name.myshopify.com", without https or slashes`
      )
      .required()
      .description(
        `Your Shopify store URL, e.g. my-unique-store-name.myshopify.com`
      ),
    password: Joi.string()
      .required()
      .description(
        `The admin password for the Shopify store + app you're using`
      ),
    salesChannel: Joi.string()
      .default(process.env.GATSBY_SHOPIFY_SALES_CHANNEL || ``)
      .description(
        `Not set by default. If set to a string (example \`My Sales Channel\`), only products, variants, collections and locations that are published to that channel will be sourced. If you want to filter products by a Private App instead of Public App or default sales channel, you have to provide the App ID instead of sales channel name. You can find this in the same place as the Shopify App Password`
      ),
    downloadImages: Joi.boolean()
      .default(false)
      .description(
        `Not set by default. If set to \`true\`, this plugin will download and process images during the build`
      ),
    prioritize: Joi.boolean().description(
      `Not set by default. Allows you to override the priority status of a build. If set to undefined, the environment variables will determine priority status. If set to true or false, it will override the environment variables and set the priority status as such.`
    ),
    shopifyConnections: Joi.array()
      .default([])
      .items(Joi.string().valid(`orders`, `collections`, `locations`))
      .description(`An optional array of additional data types to source`),
    typePrefix: Joi.string()
      .pattern(new RegExp(`(^[A-Z]w*)`))
      .message(
        `"typePrefix" can only be alphanumeric characters, starting with an uppercase letter`
      )
      .default(``)
      .description(
        `Not set by default. If set to a string (example \`MyStore\`) node names will be \`allMyStoreShopifyProducts\` instead of \`allShopifyProducts\``
      ),
    apiVersion: Joi.string()
      .default(`2024-04`)
      .description(
        `The API version that should be used. More information: https://shopify.dev/docs/api/usage/versioning`
      ),
  })
}
