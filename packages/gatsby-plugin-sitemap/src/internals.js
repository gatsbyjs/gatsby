import reporter from "gatsby-cli/lib/reporter"

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
 * Properly handles prefixing relative path with site domain, Gatsby pathPrefix and AssetPrefix
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
 * @param {object} data - results of the GraphQL query
 * @returns {string} - site URL, this can come from thegraphql query or another scope
 */
export function resolveSiteUrl(data) {
  return data.site.siteMetadata.siteUrl
}
/**
 * @name resolvePagePath
 *
 * if you don't want to place the URI in "path" then resolvePagePath
 * are needed.
 *
 * @param {object} page - Array Item returned from resolvePages
 * @returns {string} - uri of the page without domain or protocol
 */

export function resolvePagePath(page) {
  return page?.path
}
/**
 * @name resolvePages
 *
 * This allows custom resolution of the array of pages.
 * This also where user's could merge multiple sources into
 * a single array if needed.
 *
 * @param {object} data - results of the GraphQL query
 * @returns {Array} - Array of objects representing each page
 */
export function resolvePages(data) {
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
 * @param {object} page
 * @param {string} excludedRoute - Array from plugin config `options.exclude`
 * @param {object} tools - contains required tools for filtering
 *
 * @returns {boolean}
 */
export function defaultFilterPages(
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
 * This function is executed by allPages.map(page => thisFunc(page, siteUrl, tools))
 * allpages is the result of the filter process
 *
 * @param {object[]} page - results of the resolvePages function
 * @param {object} tools - contains tools for serializing
 *
 */
export function serialize(page, { resolvePagePath }) {
  return {
    url: `${resolvePagePath(page)}`,
    changefreq: `daily`,
    priority: 0.7,
  }
}

export const defaultExcludes = [
  `/dev-404-page`,
  `/404`,
  `/404.html`,
  `/offline-plugin-app-shell-fallback`,
]
