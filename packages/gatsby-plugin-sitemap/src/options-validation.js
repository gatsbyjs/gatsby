/* global: reporter */

import Joi from "joi"
import {
  resolveSiteUrl,
  resolvePagePath,
  resolvePages,
  serialize,
  defaultFilterPages,
} from "./internals"

const defaultPluginOptions = Joi.object({
  plugins: Joi.array().strip(),
  output: Joi.string().default(`/sitemap`),
  createLinkInHead: Joi.boolean().default(true),
  entryLimit: Joi.number().default(45000), // default based on upstream "sitemap" plugin default, may need optimization
  query: Joi.string().default(`
  {
    site {
      siteMetadata {
        siteUrl
      }
    }

    allSitePage {
      nodes {
        path
      }
    }
  }`),
  excludes: Joi.array().items(Joi.any()).default([]),
  resolveSiteUrl: Joi.function().default(() => resolveSiteUrl),
  resolvePagePath: Joi.function().default(() => resolvePagePath),
  resolvePages: Joi.function().default(() => resolvePages),
  filterPages: Joi.function().default(() => defaultFilterPages),
  serialize: Joi.function().default(() => serialize),
})

const ssrPluginOptions = Joi.object({
  output: defaultPluginOptions.extract([`output`]),
  createLinkInHead: defaultPluginOptions.extract([`createLinkInHead`]),
})

export async function validateOptions(pluginOptions) {
  return defaultPluginOptions.validateAsync(pluginOptions)
}

export function validateOptionsSsr(pluginOptions) {
  const { value } = ssrPluginOptions.validate(pluginOptions, {
    stripUnknown: true,
    allowUnknown: true,
  })
  return value
}
