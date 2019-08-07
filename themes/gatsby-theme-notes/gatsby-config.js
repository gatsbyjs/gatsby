module.exports = options => {
  const { mdx = true, mdxLayouts = {} } = options

  return {
    __experimentalThemes: [],
    plugins: [
      mdx && {
        resolve: `gatsby-mdx`,
        options: {
          extensions: [`.md`, `.mdx`],
          defaultLayouts: {
            default: require.resolve(`./src/components/layout`),
            ...mdxLayouts,
          },
        },
      },
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          path: options.notes || `notes`,
          name: `notes`,
        },
      },
      `gatsby-plugin-redirects`,
      `gatsby-plugin-og-image`,
      `gatsby-plugin-emotion`,
      {
        resolve: `gatsby-plugin-compile-es6-packages`,
        options: {
          modules: [`gatsby-theme-notes`],
        },
      },
    ].filter(Boolean),
  }
}
