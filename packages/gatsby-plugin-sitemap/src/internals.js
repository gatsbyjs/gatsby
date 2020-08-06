/* global: reporter */

import Joi from "joi"
import reporter from "gatsby-cli/lib/reporter"

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

export function validateSsrOptions(pluginOptions) {
  return defaultPluginOptions.validate(pluginOptions)
}

/**
 *
 * @param {string} path
 * @returns {string}
 */
export const withoutTrailingSlash = path =>
  path === `/` ? path : path.replace(/\/$/, ``)

/**
 * @name prefixPath
 *
 * Propperly handles prefixing relative path with site domain, Gatsby pathPrefix and AssetPrefix
 *
 * @param {string} url - string containing relative path
 * @param {string} siteUrl - results of the resolveSiteUrl function
 * @returns {string}
 */
// TODO: Update for v3
export function prefixPath({ url, siteUrl, pathPrefix = `` }) {
  return new URL(pathPrefix + url, siteUrl).toString()
}

/**
 * @name resolveSiteUrl
 *
 * @param {Object} data - results of the GraphQL query
 * @returns {string}
 */
function resolveSiteUrl(data) {
  return data.site.siteMetadata.siteUrl
}
/**
 * @name resolvePagePath
 *
 * if you don't want to place the URI in "path" then resolvePagePath
 * are needed.
 *
 * @param {Object|string} page - Array Item returned from reolvePages
 * @returns {string}
 */

function resolvePagePath(page) {
  return page?.path
}
/**
 * @name resolvePages
 *
 * This allows custom resolution of the array of pages.
 * This also where user's could merge multiple sources into
 * a single array if needed.
 *
 * @param {Object} data - results of the GraphQL query
 * @returns {Array}
 */
function resolvePages(data) {
  return data.allSitePage.nodes
}

/**
 * @name filterPages
 *
 * This allows filtering any data in any way.
 *
 * This Function is executed via allPages.filter((page) => !excludes.some((excludedRoute) => thisFunc(page, ecludedRoute, tools)))
 * allPages is the results of the resolvePages
 *
 * @param {Object} page
 * @param {string} excludedRoute - Array from plugin config `options.exclude`
 * @param {Object} tools - contains required tools for filtering
 *
 * @returns {Array}
 */
function filterPages(
  page,
  excludedRoute,
  { minimatch, withoutTrailingSlash, resolvePagePath }
) {
  if (typeof excludedRoute !== `string`) {
    reporter.error(
      `You've passed something other than string to the exclude array. This is supported, but you'll have to write a custom filter function. Ignoring the input for now: ${JSON.stringify(
        excludedRoute,
        null,
        2
      )}`
    )
    return false
  }
  return minimatch(
    withoutTrailingSlash(resolvePagePath(page)),
    withoutTrailingSlash(excludedRoute)
  )
}

/**
 * @name serialize
 *
 * This funciton is executed by allPages.map(page => thisFunc(page, siteUrl, tools))
 * allpages is the result of the filter process
 *
 * @param {Object} page - results of the resolvePages function
 * @param {Object} tools - contains tools for serializing
 *
 */
function serialize(page, { resolvePagePath }) {
  return {
    url: `${resolvePagePath(page)}`,
    changefreq: `daily`,
    priority: 0.7,
  }
}
