// @ts-check
import { argv, env, exit } from "node:process"
import { error, log } from "node:console"
import { execa } from "execa"

if (!env.NETLIFY_AUTH_TOKEN) {
  error(``)
  error(`============================================================`)
  error(``)
  error(`  SKIPPING: NETLIFY_AUTH_TOKEN is not set.`)
  error(``)
  error(`  This is expected for pull requests from forks.`)
  error(`  The adapter e2e tests deploy to Netlify and cannot`)
  error(`  run without credentials.`)
  error(``)
  error(`  Maintainers: to run these tests, push this branch`)
  error(`  to the main repository and re-run CI.`)
  error(``)
  error(`============================================================`)
  error(``)
  exit(0)
}

// only set NETLIFY_SITE_ID from E2E_ADAPTERS_NETLIFY_SITE_ID if it's set
if (env.E2E_ADAPTERS_NETLIFY_SITE_ID) {
  env.NETLIFY_SITE_ID = env.E2E_ADAPTERS_NETLIFY_SITE_ID
}

env.ADAPTER = "netlify"

const deployTitle = `${
  env.CIRCLE_SHA1 || "N/A commit"
} - trailingSlash:${env.TRAILING_SLASH || `always`} / pathPrefix:${
  env.PATH_PREFIX || `-`
}`

const npmScriptToRun = argv[2] || "test:netlify"

// ensure clean build
await execa(`npm`, [`run`, `clean`], {
  stdio: `inherit`,
})

const deployAlias = "gatsby-e2e-tests"

// NO_COLOR disables ANSI escape codes so the URL/deploy-id parsing below is reliable.
const deployResults = await execa(
  "npx",
  [
    "ntl",
    "deploy",
    "--alias",
    deployAlias,
    "--message",
    deployTitle,
    env.EXTRA_NTL_CLI_ARGS ?? "--cwd=.",
  ],
  {
    reject: false,
    env: {
      ...env,
      NO_COLOR: "1"
    },
  }
)

if (deployResults.stdout) {
  log(deployResults.stdout)
}

if (deployResults.stderr) {
  error(deployResults.stderr)
}

if (deployResults.exitCode !== 0) {
  exit(deployResults.exitCode)
}

// The permalink also appears as part of a "/deploys/<deploy_id>" link in the output.
const deployIdMatch = deployResults.stdout.match(/\/deploys\/([a-f0-9]+)/)

if (!deployIdMatch) {
  error(`Could not extract deploy URL or deploy ID from Netlify CLI output`)
  exit(1)
}

const deployId = deployIdMatch[1]
const deployUrl = `https://${deployId}--${env.NETLIFY_SITE_ID}.netlify.app` + (env.PATH_PREFIX ?? ``)

env.DEPLOY_URL = deployUrl
log(`Deployed to ${deployUrl}`)

try {
  await execa(`npm`, [`run`, npmScriptToRun], {
    stdio: `inherit`,
  })
} finally {
  /* if (!env.GATSBY_TEST_SKIP_CLEANUP) {
    log(`Deleting project with deploy_id ${deployId}`)

    const deleteResponse = await execa("npx", [
      "ntl",
      "api",
      "deleteDeploy",
      "--data",
      `{ "deploy_id": "${deployId}" }`,
    ])

    if (deleteResponse.exitCode !== 0) {
      throw new Error(
        `Failed to delete project ${deleteResponse.stdout} ${deleteResponse.stderr} (${deleteResponse.exitCode})`
      )
    }

    log(`Successfully deleted project with deploy_id ${deployId}`)
    } */
}
