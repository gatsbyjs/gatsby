const path = require('path')

module.exports = {
  flags: {
    DEV_SSR: true,
    FAST_DEV: true,
    PRESERVE_FILE_DOWNLOAD_CACHE: true,
    PARALLEL_SOURCING: true,
    LMDB_STORE: true,
  },
  plugins: [
    'gatsby-plugin-sharp',
    {
      resolve: `gatsby-alias-imports`,
      options: {
        aliases: {
          // TODO: might not be needed with new docs theme
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
    /* TODO
      'gatsby-transformer-documentationjs',
      {
        // Use github as the source of truth for JSDoc content
        // Used for JSDoc API reference pages
        resolve: `gatsby-source-git`,
        options: {
          name: `jsdoc`,
          remote: `https://github.com/gatsbyjs/gatsby.git`,
          branch: 'master',
          // branch: docsBranch, // TODO figure out versioning approach
          patterns: [
            `packages/gatsby/src/redux/actions/**`,
            `packages/gatsby/src/utils/**`,
            `packages/gatsby/src/schema/**`,
            `packages/gatsby/cache-dir/**`,
          ]
        }
      },
    * */
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
