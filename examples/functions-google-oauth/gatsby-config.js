module.exports = {
  siteMetadata: {
    title: "Gatsby Functions with Google OAuth Example",
  },
  // Only need for < 3.7.0 Gatsby
  // flags: {
  //   FUNCTIONS: true,
  // },
  plugins: [
    "gatsby-plugin-gatsby-cloud",
    `gatsby-plugin-sass`,
    {
      resolve: `gatsby-plugin-create-client-paths`,
      options: { prefixes: [`/app/*`] },
    },
  ],
}
