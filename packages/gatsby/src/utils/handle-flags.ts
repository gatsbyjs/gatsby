import _ from "lodash"
import { isCI } from "gatsby-core-utils"
import terminalLink from "terminal-link"
import { IFlag } from "./flags"

const handleFlags = (
  flags: Array<IFlag>,
  configFlags: Array<Array<string>>
): { validConfigFlags: Array<IFlag>; message: string } => {
  // Prepare config flags.
  // Filter out any flags that are set to false.
  const filteredConfigFlags = _.toPairs(configFlags).filter(pair => pair[1])

  // TODO move this logic into util function w/ tests.
  //  validate flags against current ones
  //  - any that don't exist — remove silently
  //  - any that are graduated — remove w/ message of thanks
  let validConfigFlags = flags.filter(ae =>
    filteredConfigFlags.some(flagPair => flagPair[0] === ae.name)
  )

  // If we're in CI, filter out any flags that don't want to be enabled in CI
  if (isCI()) {
    validConfigFlags = validConfigFlags.filter(flag => flag.noCi === true)
  }

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

    // Suggest enabling other flags if they're not trying them all.
    const otherFlagsCount = flags.length - validConfigFlags.length
    if (otherFlagsCount > 0) {
      message += `\n\nThere ${
        otherFlagsCount === 1
          ? `is one other flag`
          : `are ${otherFlagsCount} other flags`
      } available you can test — run "gatsby flags" to enable them`
    }

    message += `\n`
  }

  return { validConfigFlags, message }
}

export default handleFlags
