module.exports = {
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
        defaultLayouts: {
          default: require.resolve("./src/components/layout.js"),
        },
        gatsbyRemarkPlugins: [`gatsby-remark-images`],
        mdxOptions: {
          remarkPlugins: [remarkRequireFilePathPlugin],
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
  return function transformer(tree, file) {
    if (!file.dirname) {
      throw new Error("No directory name for this markdown file!")
    }
  }
}
