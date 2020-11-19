const yargs = require(`yargs`)
const { isCI, createRequireFromPath } = require(`gatsby-core-utils`)
const cwdRequire = createRequireFromPath(`${process.cwd()}/:internal:`)

const cliParser = yargs
  .strict()
  .option(`browser`, { type: `string` })
  .option(`env`, { type: `string`, array: true })
  .option(`config`, { type: `string`, array: true })

const args = cliParser.argv

if (args._.length > 0) {
  console.log(`Unknown command (hint there are no commands, just options)`)
  cliParser.showHelp()
  process.exit(1)
}

// need to parse --env and --config assignments
function parseAssignments(assignmentsItems) {
  if (!assignmentsItems) {
    return undefined
  }

  const parsed = {}
  // assignmentsItems will be array of strings like "A=1", "A=1,B=2"
  assignmentsItems.forEach(assignments => {
    // assignments will have shape "A=1", "A=1,B=2" etc
    assignments.split(`,`).forEach(assignment => {
      // assignment can be "A=1"
      const [key, value] = assignment.split(`=`)
      if (!key) {
        throw new Error(`Assignment "${assignment} doesn't have a key`)
      }
      if (!value) {
        throw new Error(`Assignment "${assignment} doesn't have a value`)
      }

      parsed[key] = value
    })
  })

  return parsed
}

const cypressArgs = {
  browser: args.browser,
  env: parseAssignments(args.env),
  config: parseAssignments(args.config),
  record:
    process.env.CYPRESS_PROJECT_ID && process.env.CYPRESS_RECORD_KEY && isCI(),
}

const cypress = cwdRequire(`cypress`)

cypress
  .run(cypressArgs)
  .then(result => {
    process.exit(result.totalFailed > 0 ? 1 : 0)
  })
  .catch(() => {
    process.exit(1)
  })
