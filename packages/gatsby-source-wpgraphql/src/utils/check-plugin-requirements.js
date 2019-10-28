const fetchGraphql = require(`./fetch-graphql`)

const isWpGatsby = async (_, pluginOptions) =>
  fetchGraphql({
    url: pluginOptions.url,
    query: `
      {
        isWpGatsby
      }
    `,
  })

const checkPluginRequirements = async (helpers, pluginOptions) => {
  const fetchIsWpGatsby = await isWpGatsby(helpers, pluginOptions)
  if (!fetchIsWpGatsby.data || !fetchIsWpGatsby.data.isWpGatsby) {
    console.error(
      `[gatsby-source-wpgraphql] - Couldn't connect to your WordPress site. Make sure your URL is correct and WP-GraphQL and WP-Gatsby are active.`
    )
    process.exit()
  }
}

module.exports = checkPluginRequirements
