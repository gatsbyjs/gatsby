process.env.GATSBY_EXPERIMENTAL_SOURCE_EVENTS = true

require("dotenv").config({
  path: `.env`,
})

module.exports = {
  plugins: [
    // @todo this throws errors about source-plugin-one modifying nodes from gatsby-source-eventful-contentful
    // require.resolve(`./plugins/source-plugin-one/package.json`),
    {
      resolve: require.resolve(
        `./plugins/gatsby-source-eventful-contentful/package.json`
      ),
      options: {
        accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
        space: process.env.CONTENTFUL_SPACE,
      },
    },
  ],
}
