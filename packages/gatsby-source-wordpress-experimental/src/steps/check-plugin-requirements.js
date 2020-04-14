import fetchGraphql from "~/utils/fetch-graphql"
import { formatLogMessage } from "~/utils/format-log-message"

export const supportedWpPluginVersions = {
  WPGraphQL: {
    version: `0.6.*`,
  },
  WPGatsby: {
    version: `>=0.1.8 <0.3.0`,
  },
}

// @todo replace this link with another once we're out of alpha
const genericDownloadMessage = `\n\n\tVisit https://github.com/TylerBarnes/using-gatsby-source-wordpress-experimental/tree/master/WordPress/plugins/\n\tto download the latest supported versions of WPGatsby and WPGraphL.`

const areRemotePluginVersionsSatisfied = async ({ helpers }) => {
  let wpgqlIsSatisfied
  let wpGatsbyIsSatisfied

  try {
    const { data } = await fetchGraphql({
      query: /* GraphQL */ `
        query WPGatsbyCompatibility(
          $wpgqlVersion: String!
          $wpgatsbyVersion: String!
        ) {
          wpGatsbyCompatibility(
            wpGatsbyVersionRange: $wpgatsbyVersion
            wpGQLVersionRange: $wpgqlVersion
          ) {
            satisfies {
              wpGQL
              wpGatsby
            }
          }
        }
      `,
      variables: {
        wpgqlVersion: supportedWpPluginVersions.WPGraphQL.version,
        wpgatsbyVersion: supportedWpPluginVersions.WPGatsby.version,
      },
      panicOnError: false,
      throwGqlErrors: true,
    })

    wpgqlIsSatisfied = data.wpGatsbyCompatibility.satisfies.wpGQL
    wpGatsbyIsSatisfied = data.wpGatsbyCompatibility.satisfies.wpGatsby
  } catch (e) {
    if (
      e.message.includes(
        `Cannot query field "wpGatsbyCompatibility" on type "RootQuery".`
      )
    ) {
      helpers.reporter.panic(
        formatLogMessage(
          `Your version of WPGatsby is too old to determine if we're compatible.${genericDownloadMessage}`
        )
      )
    } else {
      helpers.reporter.panic(e.message)
    }
  }

  let message

  if (!wpgqlIsSatisfied && wpGatsbyIsSatisfied) {
    message = `Your remote version of WPGraphQL is not within the accepted range (${supportedWpPluginVersions.WPGraphQL.version}).

\tDownload v0.6.3 at https://github.com/wp-graphql/wp-graphql/releases/tag/v0.6.3
`
  }

  if (!wpGatsbyIsSatisfied) {
    message = `Your remote version of WPGatsby is not within the accepted range (${supportedWpPluginVersions.WPGatsby.version})

\tDownload v0.2.0 at https://github.com/TylerBarnes/using-gatsby-source-wordpress-experimental/blob/fdbe608643f135cc40817d7d6f381d9cc36ecba3/WordPress/plugins/wp-gatsby-0.2.0.zip`
  }

  if (!wpGatsbyIsSatisfied && !wpgqlIsSatisfied) {
    message = `WPGatsby and WPGraphQL are both outside the accepted version ranges.`
  }

  if (message) {
    helpers.reporter.panic(formatLogMessage(message))
  }
}

const isWpGatsby = async () =>
  fetchGraphql({
    query: /* GraphQL */ `
      {
        isWpGatsby
      }
    `,
    errorMap: {
      from: `Cannot query field "isWpGatsby" on type "RootQuery".`,
      // @todo replace this link with another once we're out of alpha
      to: `WPGatsby is not active in your WordPress installation.\nTo download the latest versions of WPGatsby and WPGraphL, visit:\nhttps://github.com/TylerBarnes/using-gatsby-source-wordpress-experimental/tree/master/WordPress/plugins`,
    },
    panicOnError: true,
  })

const ensurePluginRequirementsAreMet = async (helpers, _pluginOptions) => {
  if (helpers.traceId === `refresh-createSchemaCustomization`) {
    return
  }

  await isWpGatsby()
  await areRemotePluginVersionsSatisfied({ helpers })
}

export { ensurePluginRequirementsAreMet }
