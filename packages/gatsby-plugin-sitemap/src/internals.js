import fs from "fs"
import pify from "pify"
import minimatch from "minimatch"

export const withoutTrailingSlash = path =>
  path === `/` ? path : path.replace(/\/$/, ``)

export const writeFile = pify(fs.writeFile)
export const renameFile = pify(fs.rename)

export function filterQuery(
  results,
  excludes,
  pathPrefix,
  resolveSiteUrl = defaultOptions.resolveSiteUrl
) {
  const { errors, data } = results

  if (errors) {
    throw new Error(errors.join(`, `))
  }

  const { allSitePage, ...otherData } = data

  let { allPages, originalType } = getNodes(allSitePage)

  // Removing excluded paths
  allPages = allPages.filter(
    page =>
      !excludes.some(excludedRoute =>
        minimatch(
          withoutTrailingSlash(page.path),
          withoutTrailingSlash(excludedRoute)
        )
      )
  )

  // Add path prefix
  allPages = allPages.map(page => {
    page.path = (pathPrefix + page.path).replace(/^\/\//g, `/`)
    return page
  })

  // siteUrl Validation

  let siteUrl = resolveSiteUrl(data)

  if (!siteUrl || siteUrl.trim().length == 0) {
    throw new Error(
      `SiteMetaData 'siteUrl' property is required and cannot be left empty. Check out the documentation to see a working example: https://www.gatsbyjs.org/packages/gatsby-plugin-sitemap/#how-to-use`
    )
  }

  // remove trailing slash of siteUrl
  siteUrl = withoutTrailingSlash(siteUrl)

  return {
    ...otherData,
    allSitePage: {
      [originalType]:
        originalType === `nodes`
          ? allPages
          : allPages.map(page => {
              return { node: page }
            }),
    },
    site: { siteMetadata: { siteUrl } },
  }
}

export const defaultOptions = {
  query: `
    {
      site {
        siteMetadata {
          siteUrl
        }
      }

      allSitePage {
        edges {
          node {
            path
          }
        }
      }
  }`,
  output: `/sitemap.xml`,
  exclude: [
    `/dev-404-page`,
    `/404`,
    `/404.html`,
    `/offline-plugin-app-shell-fallback`,
  ],
  createLinkInHead: true,
  serialize: ({ site, allSitePage }) => {
    const { allPages } = getNodes(allSitePage)
    return allPages?.map(page => {
      return {
        url: `${site.siteMetadata?.siteUrl ?? ``}${page.path}`,
        changefreq: `daily`,
        priority: 0.7,
      }
    })
  },
  resolveSiteUrl: data => data.site.siteMetadata.siteUrl,
}

function getNodes(results) {
  if (`nodes` in results) {
    return { allPages: results.nodes, originalType: `nodes` }
  }

  if (`edges` in results) {
    return {
      allPages: results?.edges?.map(edge => edge.node),
      originalType: `edges`,
    }
  }
  throw new Error(
    `[gatsby-plugin-sitemap]: Plugin is unsure how to handle the results of your query, you'll need to write custom page filter and serializer in your gatsby config`
  )
}
