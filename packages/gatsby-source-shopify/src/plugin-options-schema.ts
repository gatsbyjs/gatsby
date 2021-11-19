import { PluginOptionsSchemaArgs } from "gatsby"

export function pluginOptionsSchema({ Joi }: PluginOptionsSchemaArgs): any {
  // @ts-ignore TODO: When Gatsby updates Joi version, update type
  // Vague type error that we're not able to figure out related to isJoi missing
  // Probably related to Joi being outdated
  return Joi.object({
    password: Joi.string().required(),
    storeUrl: Joi.string()
      .pattern(/^[a-z0-9-]+\.myshopify\.com$/)
      .message(
        `The storeUrl value should be your store's myshopify.com URL in the form "my-site.myshopify.com", without https or slashes`
      )
      .required(),
    downloadImages: Joi.boolean(),
    typePrefix: Joi.string()
      .pattern(new RegExp(`(^[A-Z]w*)`))
      .message(
        `"typePrefix" can only be alphanumeric characters, starting with an uppercase letter`
      )
      .default(``),
    shopifyConnections: Joi.array()
      .default([])
      .items(Joi.string().valid(`orders`, `collections`, `locations`)),
    salesChannel: Joi.string().default(
      process.env.GATSBY_SHOPIFY_SALES_CHANNEL || ``
    ),
  })
}
