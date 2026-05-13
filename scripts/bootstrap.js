#!/usr/bin/env node
const { spawn } = require(`child_process`)

// These packages must be prepacked before the general workspace pass because
// `gatsby` consumes their generated lib/dist JS and declaration outputs during
// its own build. Lerna detects cycles in this part of the graph, so on a clean
// checkout it can otherwise schedule `gatsby` before these artifacts exist.
const bootstrapPrepackSeedPackages = [
  `gatsby-core-utils`,
  `gatsby-page-utils`,
  `gatsby-worker`,
  `gatsby-sharp`,
  `gatsby-plugin-utils`,
  `gatsby-script`,
  `create-gatsby`,
  `gatsby-cli`,
]

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

function parseArgs(args) {
  let skipInstall = false
  let frozenLockfile = false
  let concurrency = `4`
  const lernaArgs = []

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]

    if (arg === `--`) {
      lernaArgs.push(...args.slice(index))
      break
    }

    if (arg === `--skip-install`) {
      skipInstall = true
      continue
    }

    if (arg === `--frozen-lockfile`) {
      frozenLockfile = true
      continue
    }

    if (arg === `--concurrency`) {
      concurrency = String(args[index + 1] || concurrency)
      index += 1
      continue
    }

    if (arg.startsWith(`--concurrency=`)) {
      concurrency = arg.slice(`--concurrency=`.length) || concurrency
      continue
    }

    lernaArgs.push(arg)
  }

  return {
    concurrency,
    frozenLockfile,
    lernaArgs,
    skipInstall,
  }
}

async function main() {
  const { concurrency, frozenLockfile, lernaArgs, skipInstall } = parseArgs(
    process.argv.slice(2)
  )

  if (!skipInstall) {
    const installArgs = [`install`]

    if (!frozenLockfile) {
      installArgs.push(`--no-frozen-lockfile`)
    }

    await run(`pnpm`, installArgs)
  }

  // Run this seed phase serially so the cyclic packages above are fully built
  // before the normal concurrent prepack phase fans out across the workspace.
  await run(`pnpm`, [
    `exec`,
    `lerna`,
    `run`,
    `prepack`,
    `--concurrency`,
    `1`,
    `--stream`,
    ...bootstrapPrepackSeedPackages.flatMap(pkg => [`--scope`, pkg]),
  ])

  await run(`pnpm`, [
    `exec`,
    `lerna`,
    `run`,
    `prepack`,
    `--concurrency`,
    concurrency,
    `--stream`,
    ...lernaArgs,
  ])
}

main().catch(error => {
  console.error(error.message)
  process.exit(1)
})
