module.exports = {
  siteMetadata: {
    title: `Gatsby MDX Example`,
  },
  plugins: [
    {
      resolve: `gatsby-mdx`,
      options: {
        extensions: [`.mdx`],
      },
    },
  ],
}
