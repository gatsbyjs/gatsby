import _ from "lodash"
import { isCI } from "gatsby-core-utils"
import { IFlag } from "./flags"
import chalk from "chalk"
import { commaListsAnd } from "common-tags"
import { distance } from "fastest-levenshtein"

const handleFlags = (
  flags: Array<IFlag>,
  configFlags: Record<string, boolean> = {},
  executingCommand = process.env.gatsby_executing_command
): {
  enabledConfigFlags: Array<IFlag>
  unknownFlagMessage: string
  message: string
} => {
  // Prepare config flags.
  // Filter out any flags that are set to false.
  const availableFlags = new Map<string, IFlag>()
  flags.forEach(flag => {
    availableFlags.set(flag.name, flag)
  })

  // Find unknown flags someone has in their config to warn them about.
  const unknownConfigFlags: Array<{ flag: string; didYouMean: string }> = []
  for (const flagName in configFlags) {
    if (availableFlags.has(flagName)) {
      continue
    }
    let flagWithMinDistance
    let minDistance
    for (const availableFlag of flags) {
      if (availableFlag.name !== flagName) {
        const distanceToFlag = distance(flagName, availableFlag.name)
        if (!flagWithMinDistance || distanceToFlag < minDistance) {
          flagWithMinDistance = availableFlag.name
          minDistance = distanceToFlag
        }
      }
    }

    if (flagName) {
      unknownConfigFlags.push({
        flag: flagName,
        didYouMean:
          flagWithMinDistance && minDistance < 4 ? flagWithMinDistance : ``,
      })
    }
  }

  let unknownFlagMessage = ``
  if (unknownConfigFlags.length > 0) {
    unknownFlagMessage = commaListsAnd`The following flag(s) found in your gatsby-config.js are not known:`
    unknownConfigFlags.forEach(
      flag =>
        (unknownFlagMessage += `\n- ${flag.flag}${
          flag.didYouMean ? ` (did you mean: ${flag.didYouMean})` : ``
        }`)
    )
  }

  let enabledConfigFlags: Array<IFlag> = Object.keys(configFlags)
    .filter(name => configFlags[name] && availableFlags.has(name))
    .map(flagName => availableFlags.get(flagName)!)

  // Test flags to see if it wants opted in.
  const optedInFlags = new Map<string, IFlag>()
  const applicableFlags = new Map<string, IFlag>()
  const lockedInFlags = new Map<string, IFlag>()
  const lockedInFlagsThatAreInConfig = new Map<string, IFlag>()
  availableFlags.forEach(flag => {
    const isForCommand =
      flag.command === `all` || flag.command === executingCommand
    // If we're in CI, filter out any flags that don't want to be enabled in CI
    const isForCi = isCI() ? flag.noCI !== true : true

    if (!isForCommand || !isForCi) {
      return
    }

    const fitness = flag.testFitness(flag)

    const flagIsSetInConfig = typeof configFlags[flag.name] !== `undefined`

    if (fitness === `LOCKED_IN`) {
      enabledConfigFlags.push(flag)
      lockedInFlags.set(flag.name, flag)
      if (flagIsSetInConfig) {
        lockedInFlagsThatAreInConfig.set(flag.name, flag)
      }
    } else if (!flagIsSetInConfig && fitness === `OPT_IN`) {
      // if user didn't explicitly set a flag (either true or false)
      // and it qualifies for auto opt-in - add it to optedInFlags
      enabledConfigFlags.push(flag)
      optedInFlags.set(flag.name, flag)
    }

    if (fitness === true || fitness === `OPT_IN`) {
      applicableFlags.set(flag.name, flag)
    }
  })

  // Filter enabledConfigFlags against various tests
  enabledConfigFlags = enabledConfigFlags.filter(flag => {
    // Is this flag available for this command?
    const isForCommand =
      flag.command === `all` || flag.command === executingCommand
    // If we're in CI, filter out any flags that don't want to be enabled in CI
    const isForCi = isCI() ? flag.noCI !== true : true

    const passesFitness = flag.testFitness(flag)

    return isForCommand && isForCi && passesFitness
  })

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
      message += ` · (Umbrella Issue (${flag.umbrellaIssue}))`
    }
    message += ` · ${flag.description}`

    return message
  }

  let message = ``
  //  Create message about what flags are active.
  if (enabledConfigFlags.length > 0) {
    if (
      enabledConfigFlags.length - optedInFlags.size - lockedInFlags.size >
      0
    ) {
      message = `The following flags are active:`
      enabledConfigFlags.forEach(flag => {
        if (!optedInFlags.has(flag.name) && !lockedInFlags.has(flag.name)) {
          message += generateFlagLine(flag)
        }
      })
    }

    if (lockedInFlagsThatAreInConfig.size > 0) {
      if (message.length > 0) {
        message += `\n\n`
      }
      message += `Some features you configured with flags are used natively now.
Those flags no longer have any effect and you can remove them from config:`
      lockedInFlagsThatAreInConfig.forEach(flag => {
        message += generateFlagLine(flag)
      })
    }

    if (optedInFlags.size > 0) {
      if (message.length > 0) {
        message += `\n\n`
      }
      message += `We're shipping new features! For final testing, we're rolling them out first to a small % of Gatsby users
and your site was automatically chosen as one of them. With your help, we'll then release them to everyone in the next minor release.

We greatly appreciate your help testing the change. Please report any feedback good or bad in the umbrella issue. If you do encounter problems, please disable the flag by setting it to false in your gatsby-config.js like:

flags: {
  THE_FLAG: false
}

The following flags were automatically enabled on your site:`
      optedInFlags.forEach(flag => {
        message += generateFlagLine(flag)
      })
    }

    const otherFlagsCount = applicableFlags.size - enabledConfigFlags.length
    // Check if there is other flags and if the user actually set any flags themselves.
    // Don't count flags they were automatically opted into.
    if (otherFlagsCount > 0 && Object.keys(configFlags).length > 0) {
      message += `\n\nThere ${
        otherFlagsCount === 1
          ? `is one other flag`
          : `are ${otherFlagsCount} other flags`
      } available that you might be interested in:`

      const enabledFlagsSet = new Set()
      enabledConfigFlags.forEach(f => enabledFlagsSet.add(f.name))
      applicableFlags.forEach(flag => {
        if (!enabledFlagsSet.has(flag.name)) {
          message += generateFlagLine(flag)
        }
      })
    }

    if (message.length > 0) {
      message += `\n`
    }
  }

  return {
    enabledConfigFlags,
    message,
    unknownFlagMessage,
  }
}

export default handleFlags
