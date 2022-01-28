import { reporter } from "./reporter"

enum Flag {
  yes = `-y`,
  ts = `-ts`,
}

interface IArgs {
  flags: {
    yes: boolean
    ts: boolean
  }
  siteDirectory: string
}

/**
 * Parse arguments without considering position. Both cases should work the same:
 *
 * - `npm init gatsby hello-world -y`
 * - `npm init gatsby -y hello-world`
 *
 * We deliberately trade the edge case of a user attempting to create a directory name
 * prepended with a dash (e.g. `-my-project`) for flags that work regardless of position.
 */
export function parseArgs(args: Array<string>): IArgs {
  const { flags, siteDirectory } = args.reduce(
    (sortedArgs, arg) => {
      switch (arg) {
        case Flag.yes:
          sortedArgs.flags.yes = true
          break
        case Flag.ts:
          sortedArgs.flags.ts = true
          break
        default:
          if (arg.startsWith(`-`)) {
            reporter.warn(
              `Found unknown argument "${arg}", ignoring. Known arguments are: ${Flag.yes}, ${Flag.ts}`
            )
            break
          }
          sortedArgs.siteDirectory = arg
      }
      return sortedArgs
    },
    {
      flags: {
        yes: false,
        ts: false,
      },
      siteDirectory: ``,
    }
  )

  return {
    flags,
    siteDirectory,
  }
}
