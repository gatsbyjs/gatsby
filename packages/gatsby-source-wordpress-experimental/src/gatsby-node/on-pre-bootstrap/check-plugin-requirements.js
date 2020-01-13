import fetchGraphql from "../../utils/fetch-graphql"
import { getPluginOptions } from "../../utils/get-gatsby-api"

const isWpGatsby = async () =>
  fetchGraphql({
    url: getPluginOptions().url,
    query: `
        {
          isWpGatsby
        }
      `,
    errorMap: {
      from: `Cannot query field "isWpGatsby" on type "RootQuery".`,
      // @todo add a link to download WPGatsby here
      to: `WPGatsby is not active in your WordPress installation. Please install it.`,
    },
    panicOnError: true,
  })

const checkPluginRequirements = async () => {
  await isWpGatsby()
}

export default checkPluginRequirements
