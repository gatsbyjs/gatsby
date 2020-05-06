import fetchGraphql from "~/utils/fetch-graphql"
import { formatLogMessage } from "~/utils/format-log-message"

import { getPluginOptions } from "~/utils/get-gatsby-api"

import {
  supportedWpPluginVersions,
  genericDownloadMessage,
} from "~/supported-remote-plugin-versions"

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

\tDownload v ${supportedWpPluginVersions.WPGraphQL.version} at https://github.com/wp-graphql/wp-graphql/releases

\tIf you're upgrading from an earlier version, read the release notes for each version between your old and new versions to determine which breaking changes you might encounter based on your use of the schema.
`
  }

  if (!wpGatsbyIsSatisfied) {
    message = `Your remote version of WPGatsby is not within the accepted range (${supportedWpPluginVersions.WPGatsby.version})

\tDownload v ${supportedWpPluginVersions.WPGatsby.version} at https://github.com/TylerBarnes/using-gatsby-source-wordpress-experimental/tree/master/WordPress/plugins`
  }

  if (!wpGatsbyIsSatisfied && !wpgqlIsSatisfied) {
    message = `WPGatsby and WPGraphQL are both outside the accepted version ranges.
visit https://github.com/TylerBarnes/using-gatsby-source-wordpress-experimental/tree/master/WordPress/plugins to download the latest versions.`
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

  const {
    debug: { disableCompatibilityCheck },
  } = getPluginOptions()

  await isWpGatsby()

  if (!disableCompatibilityCheck) {
    await areRemotePluginVersionsSatisfied({ helpers })
  }
}

export { ensurePluginRequirementsAreMet }
