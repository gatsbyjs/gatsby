#!/usr/bin/env node

const semver = require("semver")
const commonTags = require("common-tags")

const MIN_NODE_VERSION = `10.13.0`

const version = process.version

if (
  !semver.satisfies(version, `>=${MIN_NODE_VERSION}`, {
    includePrerelease: true,
  })
) {
  console.error(
    commonTags.stripIndent(`
      Gatsby requires Node.js ${MIN_NODE_VERSION} or higher (you have ${version}).
      Upgrade Node to the latest stable release: https://gatsby.dev/upgrading-node-js
    `)
  )
  process.exit()
}

if (semver.prerelease(version)) {
  console.error(
    commonTags.stripIndent(`
    You are currently using a prerelease version of Node (${version}), which is not supported.
    You can use this for testing, but we do not recommend it in production. 
    Before reporting any bugs, please test with a supported version of Node (>=${MIN_NODE_VERSION}).`)
  )
  process.exit()
}

require(`./lib/index.js`)
