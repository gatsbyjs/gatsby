import fetchGraphql from "../../utils/fetch-graphql"

const isWpGatsby = async (_, pluginOptions) =>
  fetchGraphql({
    url: pluginOptions.url,
    query: `
        {
          isWpGatsby
        }
      `,
    errorMap: {
      from: `Cannot query field "isWpGatsby" on type "RootQuery".`,
      to: `WPGatsby is not active in your WordPress installation. Please install it.`,
    },
    exitOnError: true,
  })

const checkPluginRequirements = async (helpers, pluginOptions) => {
  await isWpGatsby(helpers, pluginOptions)
}

export default checkPluginRequirements
