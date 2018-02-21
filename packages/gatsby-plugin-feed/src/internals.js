import fs from "fs"
import pify from "pify"

export const writeFile = pify(fs.writeFile)
export const isFunction = f => (f && typeof f === `function`)

export const runQuery = (handler, query) =>
  handler(query).then(r => {
    if (r.errors) {
      throw new Error(r.errors.join(`, `))
    }

    return r.data
  })

export const defaultOptions = {
  query: `
    {
      site {
        siteMetadata {
          title
          description
          siteUrl
        }
      }
      entries: allMarkdownRemark(
        limit: 1000,
        sort: {
          order: DESC,
          fields: [frontmatter___date]
        }
      ) {
        edges {
          node {
            frontmatter {
              title
              date
            }
            fields {
              slug
            }
            excerpt
            html
          }
        }
      }
    }
  `,
  feeds: [{
    output: `rss.xml`,
  }],
}
