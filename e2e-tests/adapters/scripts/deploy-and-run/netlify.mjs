// @ts-check

import { execa } from "execa"

process.env.NETLIFY_SITE_ID = process.env.E2E_ADAPTERS_NETLIFY_SITE_ID
process.env.ADAPTER = "netlify"

const deployTitle = process.env.CIRCLE_SHA1 || "N/A"

const npmScriptToRun = process.argv[2] || "test:netlify"

const deployResults = await execa(
  "ntl",
  ["deploy", "--build", "--json", "--message", deployTitle],
  {
    reject: false,
  }
)

if (deployResults.exitCode !== 0) {
  if (deployResults.stdout) {
    console.log(deployResults.stdout)
  }
  if (deployResults.stderr) {
    console.error(deployResults.stderr)
  }

  process.exit(deployResults.exitCode)
}

const deployInfo = JSON.parse(deployResults.stdout)

process.env.DEPLOY_URL = deployInfo.deploy_url

console.log(`Deployed to ${deployInfo.deploy_url}`)

try {
  await execa(`npm`, [`run`, npmScriptToRun], { stdio: `inherit` })
} finally {
  if (!process.env.GATSBY_TEST_SKIP_CLEANUP) {
    console.log(`Deleting project with deploy_id ${deployInfo.deploy_id}`)

    const deleteResponse = await execa("ntl", [
      "api",
      "deleteDeploy",
      "--data",
      `{ "deploy_id": "${deployInfo.deploy_id}" }`,
    ])

    if (deleteResponse.exitCode !== 0) {
      throw new Error(
        `Failed to delete project ${deleteResponse.stdout} ${deleteResponse.stderr} (${deleteResponse.exitCode})`
      )
    }

    console.log(
      `Successfully deleted project with deploy_id ${deployInfo.deploy_id}`
    )
  }
}
