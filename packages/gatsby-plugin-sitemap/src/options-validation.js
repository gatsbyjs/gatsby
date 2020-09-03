/* global: reporter */

import Joi from "joi"
import {
  resolveSiteUrl,
  resolvePagePath,
  resolvePages,
  filterPages,
  serialize,
} from "./internals"

const defaultExcludes = [
  `/dev-404-page`,
  `/404`,
  `/404.html`,
  `/offline-plugin-app-shell-fallback`,
]

const defaultPluginOptions = Joi.object({
  plugins: Joi.array().strip(),
  output: Joi.string().default(`/`),
  createLinkInHead: Joi.boolean().default(true),
  sitemapSize: Joi.number().default(45000), // default based on upstream "sitemap" plugin default, maybe need optimization
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
  excludes: Joi.array()
    .items(Joi.string(), Joi.object())
    .default(parent => {
      const configExclude = parent?.exclude

      if (!configExclude) {
        return defaultExcludes
      }

      return [...defaultExcludes, ...configExclude]
    }),
  resolveSiteUrl: Joi.function().default(() => resolveSiteUrl),
  resolvePagePath: Joi.function().default(() => resolvePagePath),
  resolvePages: Joi.function().default(() => resolvePages),
  filterPages: Joi.function().default(() => filterPages),
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
