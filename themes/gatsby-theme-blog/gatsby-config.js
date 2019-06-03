module.exports = {
  siteMetadata: {
    title: `My Blog Title`,
    author: `Your Name`,
    description: `coming soon...`,
    siteUrl: `https://github.com/amberleyromo/gatsby-themes/tree/master/packages/gatsby-theme-darklight-blog`,
    social: {
      twitter: `amber1ey`,
    },
  },
  plugins: [
    /*
     * User override content
     */
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blog-posts`,
        path: `content/posts`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blog-assets`,
        path: `content/assets`,
      },
    },
    /*
     * Default/demo posts
     */
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blog-default-posts`,
        path: `${__dirname}/content/posts`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blog-default-assets`,
        path: `${__dirname}/content/assets`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-mdx`,
      options: {
        extensions: [`.mdx`, `.md`],
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
          // todo: needs styles
          { resolve: `gatsby-remark-autolink-headers` },
          { resolve: `gatsby-remark-code-titles` },
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              noInlineHighlight: true,
            },
          },
        ],
      },
    },
    {
      // should this be included in the theme?
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Gatsby Starter Blog`,
        short_name: `GatsbyJS`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: require.resolve(`./content/assets/gatsby-icon.png`),
      },
    },
    `gatsby-plugin-offline`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-twitter`,
    {
      resolve: `gatsby-plugin-page-creator`,
      options: {
        path: `${__dirname}/src/pages`,
      },
    },
  ],
}
