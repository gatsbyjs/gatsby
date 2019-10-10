module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `gatsby-plugin-mdx-src-pages`,
        // TODO: what's the Gatsby cross-plat function for this?
        path: process.cwd() + `/src/pages/`,
      },
    },
  ],
}
