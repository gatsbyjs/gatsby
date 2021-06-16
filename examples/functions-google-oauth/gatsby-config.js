module.exports = {
  siteMetadata: {
    title: "Gatsby with Loadable Components Example",
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
};
