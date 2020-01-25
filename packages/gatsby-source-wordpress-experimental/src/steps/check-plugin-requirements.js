import fetchGraphql from "~/utils/fetch-graphql"

const isWpGatsby = async () =>
  fetchGraphql({
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

const ensurePluginRequirementsAreMet = async () => {
  await isWpGatsby()
}

export default ensurePluginRequirementsAreMet
