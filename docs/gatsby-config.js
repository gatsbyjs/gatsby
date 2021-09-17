const path = require('path')

module.exports = {
  plugins: [
    'gatsby-plugin-sharp',
    {
      resolve: `gatsby-alias-imports`,
      options: {
        aliases: {
          // Relative paths when importing components from git/MDX break,
          // so use an alias instead inside MDX:
          "@components": `${__dirname}/src/components/mdx-aliases`,
        },
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'docs',
        path: path.join(__dirname, 'docs'),
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.md`, `.mdx`],
        // not sure what this is for
        // shouldBlockNodeFromTransformation(node) {
        //   return [`NPMPackage`, `NPMPackageReadme`].includes(node.internal.type)
        // },
        gatsbyRemarkPlugins: [
          `gatsby-remark-embed-video`,
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 786,
              backgroundColor: `#ffffff`,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.5rem`,
            },
          },
          `gatsby-remark-autolink-headers`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
      lessBabel: true,
    }
  ],
}
