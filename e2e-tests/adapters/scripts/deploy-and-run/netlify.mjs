// @ts-check
import { execa } from "execa"
import { inspect } from "util"
import tree from "tree-cli"

// only set NETLIFY_SITE_ID from E2E_ADAPTERS_NETLIFY_SITE_ID if it's set
if (process.env.E2E_ADAPTERS_NETLIFY_SITE_ID) {
  process.env.NETLIFY_SITE_ID = process.env.E2E_ADAPTERS_NETLIFY_SITE_ID
}
process.env.ADAPTER = "netlify"

const deployTitle = `${
  process.env.CIRCLE_SHA1 || "N/A commit"
} - trailingSlash:${process.env.TRAILING_SLASH || `always`} / pathPrefix:${
  process.env.PATH_PREFIX || `-`
}`

const npmScriptToRun = process.argv[2] || "test:netlify"

// ensure clean build
await execa(`npm`, [`run`, `clean`], { stdio: `inherit` })

const deployResults = await execa(
  "ntl",
  ["deploy", "--build", "--json", "--cwd=.", "--message", deployTitle],
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

const deployUrl = deployInfo.deploy_url + (process.env.PATH_PREFIX ?? ``)
process.env.DEPLOY_URL = deployUrl

const { report } = await tree({
  base: ".netlify",
  noreport: true, // this just avoid outputting by default, still is generated
  l: Infinity,
})

console.log(report)

console.log(inspect({ deployInfo }, { depth: Infinity }))
console.log(`Deployed to ${deployUrl}`)

try {
  await execa(`npm`, [`run`, npmScriptToRun], { stdio: `inherit` })
} finally {
  // if (!process.env.GATSBY_TEST_SKIP_CLEANUP) {
  //   console.log(`Deleting project with deploy_id ${deployInfo.deploy_id}`)
  //   const deleteResponse = await execa("ntl", [
  //     "api",
  //     "deleteDeploy",
  //     "--data",
  //     `{ "deploy_id": "${deployInfo.deploy_id}" }`,
  //   ])
  //   if (deleteResponse.exitCode !== 0) {
  //     throw new Error(
  //       `Failed to delete project ${deleteResponse.stdout} ${deleteResponse.stderr} (${deleteResponse.exitCode})`
  //     )
  //   }
  //   console.log(
  //     `Successfully deleted project with deploy_id ${deployInfo.deploy_id}`
  //   )
  // }
}
