import minimatch from "minimatch"

export const REPORTER_PREFIX = `[gatsby-plugin-sitemap]:`

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
// TODO: Update for v3 - Fix janky path/asset prefixing
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
  if (!data?.site?.siteMetadata?.siteUrl) {
    throw Error(
      `\`siteUrl\` does not exist on \`siteMetadata\` in the data returned from the query.
Add this to your \`siteMetadata\` object inside gatsby-config.js or add this to your custom query or provide a custom \`resolveSiteUrl\` function.
https://www.gatsbyjs.com/plugins/gatsby-plugin-sitemap/#api-reference
      `
    )
  }

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
  if (!page?.path) {
    throw Error(
      `\`path\` does not exist on your page object.
Make the page URI available at \`path\` or provide a custom \`resolvePagePath\` function.
https://www.gatsbyjs.com/plugins/gatsby-plugin-sitemap/#api-reference
      `
    )
  }

  return page.path
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
  if (!data?.allSitePage?.nodes) {
    throw Error(
      `Page array from \`query\` wasn't found at \`data.allSitePage.nodes\`.
Fix the custom query or provide a custom \`resolvePages\` function.
https://www.gatsbyjs.com/plugins/gatsby-plugin-sitemap/#api-reference
      `
    )
  }

  return data.allSitePage.nodes
}

/**
 * @name defaultFilterPages
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
    throw new Error(
      `You've passed something other than string to the exclude array. This is supported, but you'll have to write a custom filter function.
Ignoring the input for now: ${JSON.stringify(excludedRoute, null, 2)}
https://www.gatsbyjs.com/plugins/gatsby-plugin-sitemap/#api-reference
      `
    )
  }

  // Minimatch is always scary without an example
  // TODO add example
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

const defaultExcludes = [
  `/dev-404-page`,
  `/404`,
  `/404.html`,
  `/offline-plugin-app-shell-fallback`,
]

export function pageFilter({ allPages, filterPages, excludes }) {
  const messages = []

  if (
    !Array.isArray(allPages) ||
    typeof filterPages !== `function` ||
    !Array.isArray(excludes)
  ) {
    throw new Error(`Invalid options passed to page Filter function`)
  }

  // TODO we should optimize these loops
  const filteredPages = allPages.filter(page => {
    const defaultFilterMatches = defaultExcludes.some(exclude => {
      try {
        const doesMatch = defaultFilterPages(page, exclude, {
          minimatch,
          withoutTrailingSlash,
          resolvePagePath,
        })

        return doesMatch
      } catch {
        throw new Error(`${REPORTER_PREFIX} Error in default page filter`)
      }
    })

    if (defaultFilterMatches) {
      messages.push(
        `${REPORTER_PREFIX} Default filter excluded page ${resolvePagePath(
          page
        )}`
      )
    }

    // If page is marked to be excluded via defaults there's no need to check page for custom excludes
    if (defaultFilterMatches) {
      return !defaultFilterMatches
    }

    const customFilterMatches = excludes.some(exclude => {
      try {
        return filterPages(page, exclude, {
          minimatch,
          withoutTrailingSlash,
          resolvePagePath,
        })
      } catch {
        throw new Error(
          `${REPORTER_PREFIX} Error in custom page filter.
If you've customized your excludes you may need to provide a custom "filterPages" function in your config.
https://www.gatsbyjs.com/plugins/gatsby-plugin-sitemap/#api-reference
`
        )
      }
    })

    if (customFilterMatches) {
      messages.push(
        `${REPORTER_PREFIX} Custom filtering excluded page ${resolvePagePath(
          page
        )}`
      )
    }

    return !(defaultFilterMatches || customFilterMatches)
  })

  return { filteredPages, messages }
}
