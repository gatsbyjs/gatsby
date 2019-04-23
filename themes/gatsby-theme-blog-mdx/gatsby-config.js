const path = require(`path`)

module.exports = ({ defaultLayouts = {} } = {}) => {
  const themeLayouts = {
    posts: require.resolve(`./src/templates/post`),
  }

  return {
    siteMetadata: {
      title: `Gatsby MDX Blog`,
      siteUrl: `https://gatsbyjs.org`,
    },
    mapping: {
      "Mdx.frontmatter.author": `AuthorYaml`,
    },
    plugins: [
      {
        resolve: `gatsby-mdx`,
        options: {
          defaultLayouts: {
            ...themeLayouts,
            ...defaultLayouts,
          },
        },
      },
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          path: `posts`,
          name: `posts`,
        },
      },
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          path: path.join(__dirname, `posts`),
        },
      },
      {
        // This will eventually be the default
        resolve: `gatsby-plugin-page-creator`,
        options: {
          path: path.join(__dirname, `src`, `pages`),
        },
      },
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          name: `data`,
          path: path.join(`src`, `data`),
          ignore: [`**/.*`],
        },
      },
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          name: `data`,
          path: path.join(__dirname, `src`, `data`),
          ignore: [`**/.*`],
        },
      },
      {
        // This will eventually be the default
        resolve: `gatsby-plugin-compile-es6-packages`,
        options: {
          modules: [`gatsby-theme-mdx-blog`, `theme-ui`],
        },
      },
      `gatsby-transformer-yaml`,
      `gatsby-plugin-meta-redirect`,
      `gatsby-plugin-emotion`,
    ],
  }
}
