import _ from "lodash"
import { isCI } from "gatsby-core-utils"
import realTerminalLink from "terminal-link"
import { IFlag } from "./flags"

const terminalLink = (text, url): string => {
  if (process.env.NODE_ENV === `test`) {
    return `${text} (${url})`
  } else {
    return realTerminalLink(text, url)
  }
}

const handleFlags = (
  flags: Array<IFlag>,
  configFlags: Array<Array<string>>,
  executingCommand = process.env.gatsby_executing_command
): { validConfigFlags: Array<IFlag>; message: string } => {
  // Prepare config flags.
  // Filter out any flags that are set to false.
  const filteredConfigFlags = _.toPairs(configFlags).filter(pair => pair[1])

  //  validate flags against current ones
  //  - any that don't exist — remove silently
  let validConfigFlags = flags.filter(ae =>
    filteredConfigFlags.some(flagPair => flagPair[0] === ae.name)
  )

  // If we're in CI, filter out any flags that don't want to be enabled in CI
  if (isCI() || process.env.NODE_ENV === `test`) {
    validConfigFlags = validConfigFlags.filter(flag => flag.noCi !== true)
  }

  // Filter out any flags that aren't for this environment.
  validConfigFlags = validConfigFlags.filter(
    flag => flag.command === `all` || flag.command === executingCommand
  )

  const addIncluded = (flag): void => {
    if (flag.includedFlags) {
      flag.includedFlags.forEach(includedName => {
        const incExp = flags.find(e => e.name == includedName)
        if (incExp) {
          validConfigFlags.push(incExp)
          addIncluded(incExp)
        }
      })
    }
  }
  // Add to validConfigFlags any includedFlags
  validConfigFlags.forEach(flag => {
    addIncluded(flag)
  })

  validConfigFlags = _.uniq(validConfigFlags)

  // TODO remove flags that longer exist.
  //  w/ message of thanks

  let message = ``
  //  Create message about what flags are active.
  if (validConfigFlags.length > 0) {
    message = `The following flags are active:`
    validConfigFlags.forEach(flag => {
      message += `\n- ${flag.name}`
      if (flag.umbrellaIssue) {
        message += ` (${terminalLink(`Umbrella Issue`, flag.umbrellaIssue)})`
      }
      message += ` - ${flag.description}`
    })

    // TODO renable once "gatsby flags` CLI command exists.
    // Suggest enabling other flags if they're not trying them all.
    // const otherFlagsCount = flags.length - validConfigFlags.length
    // if (otherFlagsCount > 0) {
    // message += `\n\nThere ${
    // otherFlagsCount === 1
    // ? `is one other flag`
    // : `are ${otherFlagsCount} other flags`
    // } available you can test — run "gatsby flags" to enable them`
    // }

    message += `\n`
  }

  return { validConfigFlags, message }
}

export default handleFlags
