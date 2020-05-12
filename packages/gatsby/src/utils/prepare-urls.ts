import address from "address"
import chalk from "chalk"
import url from "url"

export interface IPreparedUrls {
  lanUrlForConfig: string
  lanUrlForTerminal: string
  localUrlForTerminal: string
  localUrlForBrowser: string
}

export function prepareUrls(
  protocol: `http` | `https`,
  host: string,
  port: number
): IPreparedUrls {
  const formatUrl = (hostname: string): string =>
    url.format({
      protocol,
      hostname,
      port,
      pathname: `/`,
    })
  const prettyPrintUrl = (hostname: string): string =>
    url.format({
      protocol,
      hostname,
      port: chalk.bold(String(port)),
      pathname: `/`,
    })

  const isUnspecifiedHost = host === `0.0.0.0` || host === `::`
  let prettyHost = host
  let lanUrlForConfig
  let lanUrlForTerminal
  if (isUnspecifiedHost) {
    prettyHost = `localhost`

    try {
      // This can only return an IPv4 address
      lanUrlForConfig = address.ip()
      if (lanUrlForConfig) {
        // Check if the address is a private ip
        // https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
        if (
          /^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(
            lanUrlForConfig
          )
        ) {
          // Address is private, format it for later use
          lanUrlForTerminal = prettyPrintUrl(lanUrlForConfig)
        } else {
          // Address is not private, so we will discard it
          lanUrlForConfig = undefined
        }
      }
    } catch (_e) {
      // ignored
    }
  }
  // TODO collect errors (GraphQL + Webpack) in Redux so we
  // can clear terminal and print them out on every compile.
  // Borrow pretty printing code from webpack plugin.
  const localUrlForTerminal = prettyPrintUrl(prettyHost)
  const localUrlForBrowser = formatUrl(prettyHost)
  return {
    lanUrlForConfig,
    lanUrlForTerminal,
    localUrlForTerminal,
    localUrlForBrowser,
  }
}
