import fetchGraphql from "./fetch-graphql"

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
      `[gatsby-source-wordpress] - Couldn't connect to WPGatsby, please install it :)`
    )
    process.exit()
  }
}

export default checkPluginRequirements
