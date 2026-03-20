const ignore = require(`ignore`)
const fs = require(`fs-extra`)
const yargs = require(`yargs`)
const chalk = require(`chalk`)
const _ = require(`lodash`)
const path = require(`path`)
const packlist = require(`npm-packlist`)
const readline = require(`readline/promises`)
const { execSync } = require(`child_process`)
const {
  getChangedWorkspacePackages,
  getWorkspacePackages,
} = require(`./utils/workspace`)

const argv = yargs
  .command(
    `* <bump>`,
    `Clear previously built and potentially stale files in packages`,
    commandBuilder => {
      commandBuilder.positional(`bump`, {
        choices: [
          `major`,
          `minor`,
          `patch`,
          `premajor`,
          `preminor`,
          `prepatch`,
          `prerelease`,
        ],
      })
    }
  )

  .option(`dry-run`, {
    default: false,
    describe: `Don't delete files - just show what would be deleted`,
  })
  .option(`verbose`, {
    default: false,
    describe: `Show files that would be bundled and mark files that will be deleted`,
  })
  .option(`force`, {
    default: false,
    describe: `Force deletion of file without prompting user to confirm`,
  }).argv

const verbose = argv[`dry-run`] || argv[`verbose`]

const buildIgnoreArray = str =>
  str
    .split(`\n`)
    .filter(line => {
      if (!line || line[0] === `#`) {
        return false
      }

      return true
    })
    .reduce((acc, item) => {
      acc.push(item)

      if (!/\*\*$/.test(item)) {
        acc.push(`${item}/**`)
      }
      return acc
    }, [])

const getListOfFilesToClear = async ({ location, name }) => {
  let gitignore = []
  try {
    gitignore = buildIgnoreArray(
      fs.readFileSync(path.join(location, `.gitignore`), `utf-8`)
    )
  } catch {
    // not all packages have .gitignore
  } finally {
    const notTrackedFiles = execSync(
      `git ls-files --others --exclude-standard`,
      {
        cwd: location,
      }
    )
      .toString()
      .split(`\n`)

    gitignore = gitignore.concat(notTrackedFiles)
  }

  const result = await packlist({ path: location })
  const ig = ignore().add(gitignore)

  console.log(`Files that will be deleted for ${chalk.bold(name)}:`)

  return result
    .filter(file => {
      const willBeDeleted = ig.ignores(file)
      if (verbose || willBeDeleted) {
        console.log(
          `[ ${
            willBeDeleted ? chalk.red(`DEL`) : chalk.green(` - `)
          } ] ${path.posix.join(file)}`
        )
      }

      return willBeDeleted
    })
    .map(file => path.join(location, file))
}

async function confirm(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  try {
    const answer = await rl.question(`${message} [y/N] `)
    return /^y(es)?$/i.test(answer.trim())
  } finally {
    rl.close()
  }
}

async function run() {
  const changedPackages = getChangedWorkspacePackages(getWorkspacePackages())
  const filesToDelete = _.flatten(
    await Promise.all(changedPackages.map(getListOfFilesToClear))
  )

  if (argv[`dry-run`] || filesToDelete.length === 0) {
    return
  }

  if (
    argv[`force`] ||
    (await confirm(`Are you sure you want to delete those files?`))
  ) {
    filesToDelete.forEach(file => {
      fs.removeSync(file)
    })
    return
  }

  console.log(
    `${chalk.red(
      `Stopping publish`
    )}: there are files that need to be cleared.\n\nIf this is a bug in the check script and everything is fine, rerun the publish script directly to skip checks (and then fix clear-package-dir).`
  )
  process.exit(1)
}

run().catch(error => {
  console.error(error)
  process.exit(1)
})
