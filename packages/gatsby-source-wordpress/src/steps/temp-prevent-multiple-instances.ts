import { Reporter } from "gatsby"
import { formatLogMessage } from "../utils/format-log-message"
let isWpSourcePluginInstalled = false

/**
 * Temporarily break the build when a user defines multiple source configs for the plugin
 * See https://github.com/gatsbyjs/gatsby-source-wordpress/issues/251
 * @param {Reporter} reporter
 */

export function tempPreventMultipleInstances({
  reporter,
}: {
  reporter: Reporter
}): void {
  if (isWpSourcePluginInstalled) {
    reporter.panic(
      formatLogMessage(
        [
          `Multiple instances of this plugin aren't currently supported yet.`,
          `Follow this issue for updates https://github.com/gatsbyjs/gatsby-source-wordpress/issues/58`,
        ].join(`\n\n`),
        { useVerboseStyle: true }
      )
    )
  } else {
    isWpSourcePluginInstalled = true
  }
}
