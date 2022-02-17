const path = require("path")

module.exports = {
  siteMetadata: {
    description: `Description placeholder`,
    social: {
      twitter: `twitter placeholder`,
    },
  },
  plugins: [
    {
      resolve: `gatsby-plugin-page-creator`,
      options: {
        path: path.resolve(`src/pages`),
      },
    },
  ],
}
