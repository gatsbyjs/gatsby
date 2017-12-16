import fs from "fs"
import pify from "pify"

export const writeFile = pify(fs.writeFile)

export const runQuery = (handler, query) =>
  handler(query).then(r => {
    if (r.errors) {
      throw new Error(r.errors.join(`, `))
    }

    return r.data
  })

export const regexExclude404 = /^(?!\/(dev-404-page|404)).*$/

export const defaultOptions = {
  query: `
    {
      site {
        siteMetadata {
          siteUrl
        }
      }

      allSitePage(
        filter: {
          path: {
            regex: "${regexExclude404}"
          }
        }
      ) {
        edges {
          node {
            path
          }
        }
      }
  }`,
  output: `/sitemap.xml`,
  serialize: ({ site, allSitePage }) =>
    allSitePage.edges.map(edge => {
      return {
        url: site.siteMetadata.siteUrl + edge.node.path,
        changefreq: `daily`,
        priority: 0.7,
      }
    }),
}
