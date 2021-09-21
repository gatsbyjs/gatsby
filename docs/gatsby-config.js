const path = require('path')

const IS_LOCAL = process.cwd() === __dirname

const config = (options) => {
  const {
    name = 'theme-official-docs',
  } = options

  const plugins = [
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name,
        path: path.join(__dirname, 'docs'),
      },
    },
    'gatsby-plugin-catch-links',
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
  ]

  if (IS_LOCAL) {
    plugins.push(
      'gatsby-plugin-sharp',
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
    )
  }

  return {
    plugins,
  }
}

const localOptions = {
}

module.exports = IS_LOCAL ? config(localOptions) : config
