const path = require(`path`)
require(`dotenv`).config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  plugins: [
    {
      resolve: require.resolve(`../gatsby-site-theme`),
    },
  ],
}
