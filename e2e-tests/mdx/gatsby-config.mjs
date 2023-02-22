import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import { dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const config = {
  siteMetadata: {
    title: `Gatsby MDX e2e`,
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
        name: `pages`,
        path: `${__dirname}/src/posts`,
      },
    },
    `gatsby-plugin-test-regression1`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.mdx`, `.md`],
        gatsbyRemarkPlugins: [
          `gatsby-remark-images`,
          `gatsby-remark-autolink-headers`,
        ],
        mdxOptions: {
          remarkPlugins: [
            remarkRequireFilePathPlugin,
            // This is an esm only packages, It should work out of the box
            remarkGfm,
          ],

          rehypePlugins: [
            // This is an esm only packages, It should work out of the box
            rehypeSlug,
          ],
        },
      },
    },
    !process.env.CI && `gatsby-plugin-webpack-bundle-analyser-v2`,
  ].filter(Boolean),
}

/**
 * This is a test to ensure that `gatsby-plugin-mdx` correctly pass the `file` argument to the underlying remark plugins.
 * See #26914 for more info.
 */
function remarkRequireFilePathPlugin() {
  return function transformer(_, file) {
    if (!file.dirname) {
      throw new Error("No directory name for this markdown file!")
    }
  }
}

export default config
