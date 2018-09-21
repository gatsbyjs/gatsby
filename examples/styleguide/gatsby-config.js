const path = require(`path`)

module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: path.join(__dirname, `src/components`),
        name: `components`,
      },
    },
    {
      resolve: `gatsby-transformer-react-docgen`,
    },
    {
      resolve: `gatsby-transformer-remark`,
    },
  ],
}
