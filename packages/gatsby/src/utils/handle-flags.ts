import _ from "lodash"
import { isCI } from "gatsby-core-utils"
import realTerminalLink from "terminal-link"
import { IFlag } from "./flags"
import chalk from "chalk"

const terminalLink = (text, url): string => {
  if (process.env.NODE_ENV === `test`) {
    return `${text} (${url})`
  } else {
    return realTerminalLink(text, url)
  }
}

const handleFlags = (
  flags: Array<IFlag>,
  configFlags: Record<string, boolean>,
  executingCommand = process.env.gatsby_executing_command
): { enabledConfigFlags: Array<IFlag>; message: string } => {
  // Prepare config flags.
  // Filter out any flags that are set to false.
  const availableFlags = new Map()
  flags.forEach(flag => availableFlags.set(flag.name, flag))
  let enabledConfigFlags = Object.keys(configFlags)
    .filter(name => configFlags[name] && availableFlags.has(name))
    .map(flagName => availableFlags.get(flagName))

  // If we're in CI, filter out any flags that don't want to be enabled in CI
  if (isCI()) {
    enabledConfigFlags = enabledConfigFlags.filter(flag => flag.noCi !== true)
  }

  // Filter out any flags that aren't for this environment.
  enabledConfigFlags = enabledConfigFlags.filter(
    flag => flag.command === `all` || flag.command === executingCommand
  )

  const addIncluded = (flag): void => {
    if (flag.includedFlags) {
      flag.includedFlags.forEach(includedName => {
        const incExp = flags.find(e => e.name == includedName)
        if (incExp) {
          enabledConfigFlags.push(incExp)
          addIncluded(incExp)
        }
      })
    }
  }
  // Add to enabledConfigFlags any includedFlags
  enabledConfigFlags.forEach(flag => {
    addIncluded(flag)
  })

  enabledConfigFlags = _.uniq(enabledConfigFlags)

  // TODO remove flags that longer exist.
  //  w/ message of thanks

  const generateFlagLine = (flag): string => {
    let message = ``
    message += `\n- ${flag.name}`
    if (flag.experimental) {
      message += ` · ${chalk.white.bgRed.bold(`EXPERIMENTAL`)}`
    }
    if (flag.umbrellaIssue) {
      message += ` · (${terminalLink(`Umbrella Issue`, flag.umbrellaIssue)})`
    }
    message += ` · ${flag.description}`

    return message
  }

  let message = ``
  //  Create message about what flags are active.
  if (enabledConfigFlags.length > 0) {
    message = `The following flags are active:`
    enabledConfigFlags.forEach(flag => {
      message += generateFlagLine(flag)
    })

    const otherFlagsCount = flags.length - enabledConfigFlags.length
    if (otherFlagsCount > 0) {
      message += `\n\nThere ${
        otherFlagsCount === 1
          ? `is one other flag`
          : `are ${otherFlagsCount} other flags`
      } available that you might be interested in:`

      flags.forEach(flag => {
        if (!enabledConfigFlags.some(f => f.name === flag.name)) {
          message += generateFlagLine(flag)
        }
      })
    }

    message += `\n`
  }

  return { enabledConfigFlags, message }
}

export default handleFlags
