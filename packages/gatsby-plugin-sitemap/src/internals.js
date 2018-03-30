import fs from "fs"
import pify from "pify"
import minimatch from "minimatch"
import { withPrefix } from "gatsby-link"

const withoutTrailingSlash = path =>
  path === `/` ? path : path.replace(/\/$/, ``)

export const writeFile = pify(fs.writeFile)

export const runQuery = (handler, query, excludes) =>
  handler(query).then(r => {
    if (r.errors) {
      throw new Error(r.errors.join(`, `))
    }

    // Removing exluded paths
    r.data.allSitePage.edges = r.data.allSitePage.edges.filter(
      page => !excludes.some(
        excludedRoute => minimatch(withoutTrailingSlash(page.node.path), excludedRoute)
      )
    )

    return r.data
  })

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
  serialize: ({ site, allSitePage }) =>
    allSitePage.edges.map(edge => {
      return {
        url: site.siteMetadata.siteUrl + withPrefix(edge.node.path),
        changefreq: `daily`,
        priority: 0.7,
      }
    }),
}
