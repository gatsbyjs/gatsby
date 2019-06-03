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
          { resolve: `gatsby-remark-code-titles` },
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              noInlineHighlight: true,
            },
          },
        ],
        remarkPlugins: [
          require(`remark-slug`),
          [
            require(`remark-autolink-headings`),
            {
              content: {
                type: `element`,
                // custom MDX element - is this too magical??
                tagName: `link-icon`,
                propertis: {
                  className: `link-icon`,
                },
              },
            },
          ],
        ],
      },
    },
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
