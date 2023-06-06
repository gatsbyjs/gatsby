import url from "url"
import Range from "semver/classes/range"

import type { NodePluginArgs } from "gatsby"
import fetch from "node-fetch"

import fetchGraphql from "~/utils/fetch-graphql"
import { formatLogMessage } from "~/utils/format-log-message"
import { getPersistentCache } from "~/utils/cache"

import { getStore } from "~/store"
import { MD5_CACHE_KEY } from "~/constants"

import {
  supportedWpPluginVersions,
  genericDownloadMessage,
} from "~/supported-remote-plugin-versions"

const parseRange = (
  range: string
): {
  message: string
  minVersion: string
  maxVersion: string
  isARange: boolean
} => {
  const {
    set: [versions],
  } = new Range(range)

  const isARange = versions.length >= 2
  const minVersion = versions[0].semver.version
  const maxVersion = versions[1]?.semver?.version

  let message: string
  if (isARange) {
    message = `Install a version between ${minVersion} and ${maxVersion}.`
  } else {
    message = `Install version ${minVersion}.`
  }

  return {
    message,
    minVersion,
    maxVersion,
    isARange,
  }
}

const areRemotePluginVersionsSatisfied = async ({
  helpers,
  disableCompatibilityCheck,
  url: wpGraphQLEndpoint,
}: {
  helpers: NodePluginArgs
  url: string
  disableCompatibilityCheck: boolean
}): Promise<void> => {
  if (disableCompatibilityCheck) {
    return
  }

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
      isFirstRequest: true,
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

  const shouldDisplayWPGraphQLReason =
    !wpgqlIsSatisfied && supportedWpPluginVersions.WPGraphQL.reason

  const shouldDisplayWPGatsbyReason =
    !wpGatsbyIsSatisfied && supportedWpPluginVersions.WPGatsby.reason

  const shouldDisplayAtleastOneReason =
    shouldDisplayWPGraphQLReason || shouldDisplayWPGatsbyReason

  const shouldDisplayBothReasons =
    shouldDisplayWPGraphQLReason && shouldDisplayWPGatsbyReason

  // a message explaining why these are the minimum versions
  const reasons = `${shouldDisplayAtleastOneReason ? `\n\nReasons:\n\n` : ``}${
    shouldDisplayWPGraphQLReason
      ? `- ${supportedWpPluginVersions.WPGraphQL.reason}`
      : ``
  }${shouldDisplayBothReasons ? `\n\n` : ``}${
    shouldDisplayWPGatsbyReason
      ? `- ${supportedWpPluginVersions.WPGatsby.reason}`
      : ``
  }`

  let message = ``

  if (!wpgqlIsSatisfied) {
    const { minVersion, maxVersion } = parseRange(
      supportedWpPluginVersions.WPGraphQL.version
    )

    message += `Your remote version of WPGraphQL is not within the accepted range\n(${
      supportedWpPluginVersions.WPGraphQL.version
    }).\n\nThis is not a bug and it means one of two things:\n you either need to upgrade WPGraphQL or gatsby-source-wordpress.

1. If the version of WPGraphQL in your WordPress instance is higher than ${
      maxVersion || minVersion
    }
it means you need to upgrade your version of gatsby-source-wordpress.

2. If the version of WPGraphQL in your WordPress instance is lower than ${minVersion}
it means you need to upgrade your version of WPGraphQL.

You can find a matching WPGraphQL version at https://github.com/wp-graphql/wp-graphql/releases`
  }

  if (!wpGatsbyIsSatisfied && !wpgqlIsSatisfied) {
    message += `\n\n---------------\n\n`
  }

  if (!wpGatsbyIsSatisfied) {
    const { minVersion, maxVersion } = parseRange(
      supportedWpPluginVersions.WPGatsby.version
    )

    const { hostname, protocol } = url.parse(wpGraphQLEndpoint)

    message += `Your remote version of WPGatsby is not within the accepted range\n(${
      supportedWpPluginVersions.WPGatsby.version
    })\n\nThis is not a bug and it means one of two things:\n you either need to upgrade WPGatsby or gatsby-source-wordpress.

1. If the version of WPGatsby in your WordPress instance is higher than ${
      maxVersion || minVersion
    }
it means you need to upgrade your version of gatsby-source-wordpress.

2. If the version of WPGatsby in your WordPress instance is lower than ${minVersion}
it means you need to upgrade your version of WPGatsby.

Download a matching version at https://github.com/gatsbyjs/wp-gatsby/releases
or update via ${protocol}//${hostname}/wp-admin/plugins.php`
  }

  if (!wpGatsbyIsSatisfied || !wpgqlIsSatisfied) {
    message += `
${reasons}`
  }

  if (message) {
    helpers.reporter.panic(formatLogMessage(message))
  }
}

// This blank request is used to find debug messages
// when a graphql request is made with no query
// for example if 2 root fields are registered with the fieldname "products"
// this will throw a helpful error message explaining that one should be removed
const blankGetRequest = async ({
  url,
  helpers,
}: {
  url: string
  helpers: NodePluginArgs
}): Promise<void> =>
  fetch(url)
    .then(response => response.json())
    .then(json => {
      if (json?.errors?.length) {
        const firstError = json.errors[0]

        if (
          firstError.debugMessage ||
          (firstError.message &&
            !firstError.message?.includes(
              `GraphQL Request must include at least one of those two parameters: "query" or "queryId"`
            ))
        ) {
          helpers.reporter.panic(
            formatLogMessage(`WPGraphQL returned a debug message on startup:

${firstError.debugMessage || firstError.message}
          `)
          )
        }
      }
    })
    .catch(() => {
      // this is ignored because a /graphql request will always return a 200 at this point
      // we've already checked prior to this point that /graphql is up and returns a response.
    })

const isWpGatsby = async (): Promise<void> => {
  fetchGraphql({
    query: /* GraphQL */ `
      {
        isWpGatsby
      }
    `,
    errorMap: {
      from: `Cannot query field "isWpGatsby" on type "RootQuery".`,
      // @todo replace this link with another once we're out of alpha
      to: `WPGatsby is not active in your WordPress installation.\nTo download the latest version of WPGatsby visit https://wordpress.org/plugins/wp-gatsby/`,
    },
    panicOnError: true,
    isFirstRequest: true,
  })
}

const prettyPermalinksAreEnabled = async ({
  helpers,
}: {
  helpers: NodePluginArgs
}): Promise<void> => {
  try {
    const { data } = await fetchGraphql({
      query: /* GraphQL */ `
        {
          generalSettings {
            url
          }
          wpGatsby {
            arePrettyPermalinksEnabled
          }
        }
      `,
      throwGqlErrors: true,
      isFirstRequest: true,
    })

    if (!data.wpGatsby.arePrettyPermalinksEnabled) {
      helpers.reporter.log(``)
      helpers.reporter.warn(
        formatLogMessage(`
Pretty permalinks are not enabled in your WordPress instance.
Gatsby routing requires this setting to function properly.
Please enable pretty permalinks by changing your settings at
${data.generalSettings.url}/wp-admin/options-permalink.php.
`)
      )
    }
  } catch (e) {
    // the WPGatsby version is too old to query for wpGatsby.arePrettyPermalinksEnabled
  }
}

const ensurePluginRequirementsAreMet = async (
  helpers: NodePluginArgs
): Promise<void> => {
  if (
    helpers.traceId === `refresh-createSchemaCustomization` ||
    // PQR doesn't have a trace id.
    // By the time this runs in PQR we don't need it to run again.
    !helpers.traceId
  ) {
    return
  }

  const activity = helpers.reporter.activityTimer(
    formatLogMessage(`ensuring plugin requirements are met`)
  )

  activity.start()

  const {
    gatsbyApi: {
      pluginOptions: {
        url,
        debug: { disableCompatibilityCheck },
      },
    },
    remoteSchema: { schemaWasChanged },
  } = getStore().getState()

  // if we don't have a cached remote schema MD5, this is a cold build
  const isFirstBuild = !(await getPersistentCache({ key: MD5_CACHE_KEY }))

  if (
    !schemaWasChanged &&
    !isFirstBuild &&
    helpers.traceId !== `schemaWasChanged`
  ) {
    activity.end()
    return
  }

  await blankGetRequest({ url, helpers })
  await isWpGatsby()

  await Promise.all([
    prettyPermalinksAreEnabled({ helpers }),
    areRemotePluginVersionsSatisfied({
      helpers,
      url,
      disableCompatibilityCheck,
    }),
  ])

  activity.end()
}

export { ensurePluginRequirementsAreMet }
