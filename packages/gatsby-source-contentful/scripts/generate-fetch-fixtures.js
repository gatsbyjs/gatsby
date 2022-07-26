// Helper script to generate the test fixtures for the contentfulFetch call

import { writeFileSync } from "fs"
import { resolve } from "path"

import fetch from "gatsby-source-contentful/src/fetch"

let syncToken = ``
const reporter = {
  verbose: console.log,
  info: console.info,
  panic: console.error,
}

const generateFixutures = async () => {
  const pluginConfig = new Map([
    [`spaceId`, `ahntqop9oi7x`],
    [`accessToken`, `JW5Rm2ZoQl6eoqxcTC1b0J_4eUmXoBljtY9aLGRhRYw`],
    [`environment`, `master`],
  ])
  pluginConfig.getOriginalPluginOptions = () => {
    return {}
  }

  const result = await fetch({ syncToken, reporter, pluginConfig })

  writeFileSync(
    resolve(__dirname, `fetch-result.json`),
    JSON.stringify(result, null, 2)
  )

  console.log(`Updated result json`)
}

generateFixutures()
