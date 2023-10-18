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
const deployUrl = deployInfo.deploy_url

process.env.DEPLOY_URL = deployUrl

try {
  await execa(`npm`, [`run`, npmScriptToRun], { stdio: `inherit` })
} finally {
  // delete deploy
  console.log(`finally`)
}
