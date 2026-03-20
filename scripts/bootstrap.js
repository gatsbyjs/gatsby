#!/usr/bin/env node
const { spawn } = require(`child_process`)
const yargs = require(`yargs`)
const {
  getWorkspacePackages,
  selectWorkspacePackages,
} = require(`./utils/workspace`)

function run(command, args, { env = process.env } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: `inherit`,
      env,
    })

    child.on(`error`, reject)
    child.on(`exit`, code => {
      if (code === 0) {
        resolve()
      } else {
        reject(
          new Error(`${command} ${args.join(` `)} exited with code ${code}`)
        )
      }
    })
  })
}

const argv = yargs(process.argv.slice(2))
  .scriptName(`bootstrap`)
  .option(`scope`, {
    type: `array`,
    default: [],
    describe: `Only prepack workspace packages matching the provided patterns`,
  })
  .option(`ignore`, {
    type: `array`,
    default: [],
    describe: `Exclude workspace packages matching the provided patterns`,
  })
  .option(`concurrency`, {
    type: `string`,
    default: `4`,
    describe: `pnpm workspace concurrency value`,
  })
  .option(`skip-install`, {
    type: `boolean`,
    default: false,
    describe: `Skip the root pnpm install step`,
  })
  .option(`frozen-lockfile`, {
    type: `boolean`,
    default: false,
    describe: `Run pnpm install with --frozen-lockfile`,
  })
  .parserConfiguration({
    "populate--": true,
  })
  .help().argv

async function main() {
  if (!argv[`skip-install`]) {
    const installArgs = [`install`]

    if (!argv[`frozen-lockfile`]) {
      installArgs.push(`--no-frozen-lockfile`)
    }

    await run(`pnpm`, installArgs)
  }

  await run(`node`, [`scripts/check-versions.js`])

  const selectedPackages = selectWorkspacePackages(getWorkspacePackages(), {
    scope: argv.scope.map(String),
    ignore: argv.ignore.map(String),
  })
  const selectedPackageNames = new Set(selectedPackages.map(pkg => pkg.name))
  const prepackArgs = Array.isArray(argv[`--`]) ? argv[`--`].map(String) : []

  if (selectedPackageNames.has(`gatsby-core-utils`)) {
    await run(`pnpm`, [
      `exec`,
      `lerna`,
      `run`,
      `prepack`,
      `--scope`,
      `gatsby-core-utils`,
      ...(prepackArgs.length > 0 ? [`--`, ...prepackArgs] : []),
    ])
  }

  const workspaceArgs = [
    `exec`,
    `lerna`,
    `run`,
    `prepack`,
    `--concurrency`,
    String(argv.concurrency),
    `--stream`,
    `--ignore`,
    `gatsby-core-utils`,
  ]

  for (const scopePattern of argv.scope.map(String)) {
    workspaceArgs.push(`--scope`, scopePattern)
  }

  for (const ignorePattern of argv.ignore.map(String)) {
    workspaceArgs.push(`--ignore`, ignorePattern)
  }

  if (prepackArgs.length > 0) {
    workspaceArgs.push(`--`, ...prepackArgs)
  }

  const packagesToPrepack = selectedPackages.filter(
    pkg => pkg.name !== `gatsby-core-utils`
  )
  if (packagesToPrepack.length > 0) {
    await run(`pnpm`, workspaceArgs)
  }
}

main().catch(error => {
  console.error(error.message)
  process.exit(1)
})
