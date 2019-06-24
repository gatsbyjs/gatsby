module.exports = options => {
  const { mdx = true, mdxLayouts = {} } = options

  return {
    siteMetadata: {
      title: `Blog Title Placeholder`,
      author: `Name Placeholder`,
      description: `Description placeholder`,
      siteUrl: `http://example.com/`,
      social: {
        twitter: `https://twitter.com/gatsbyjs`,
        github: `https://github.com/gatsbyjs/gatsby`,
      },
    },
    plugins: [
      mdx && {
        resolve: `gatsby-mdx`,
        options: {
          extensions: [`.mdx`, `.md`],
          // defaultLayouts: {
          //   default: require.resolve(`./src/components/layout`),
          //   ...mdxLayouts,
          // },
          gatsbyRemarkPlugins: [
            {
              resolve: `gatsby-remark-images`,
              options: {
                // should this be configurable by the end-user?
                maxWidth: 1380,
                linkImagesToOriginal: false,
              },
            },
            { resolve: `gatsby-remark-responsive-iframe` },
            { resolve: `gatsby-remark-copy-linked-files` },
            { resolve: `gatsby-remark-numbered-footnotes` },
            { resolve: `gatsby-remark-smartypants` },
            { resolve: `gatsby-remark-code-titles` },
            {
              resolve: `gatsby-remark-prismjs`,
              options: {
                noInlineHighlight: true,
              },
            },
          ],
          remarkPlugins: [require(`remark-slug`)],
        },
      },
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          path: options.contentDir || `posts`,
          name: `posts`,
        },
      },
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          path: options.assetDir || `assets`,
          name: `assets`,
        },
      },
      `gatsby-transformer-sharp`,
      `gatsby-plugin-sharp`,
      `gatsby-plugin-react-helmet`,
      `gatsby-plugin-twitter`,
      `gatsby-plugin-emotion`,
    ],
  }
}
