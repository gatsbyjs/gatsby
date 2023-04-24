import remarkGfm from "remark-gfm"
import { dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * @type {import('gatsby').GatsbyConfig}
 */
const config = {
  siteMetadata: {
    title: `Using MDX example`,
    description: `Kick off your next, great Gatsby project with MDX.`,
    author: `@pragmaticpat`,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/src/pages/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `posts`,
        path: `${__dirname}/content/posts/`,
      },
    },
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        mdxOptions: {
          remarkPlugins: [remarkGfm],
        },
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 690,
            },
          },
        ],
      },
    },
  ],
}

export default config
