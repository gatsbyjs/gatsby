#!/usr/bin/env node
const path = require(`path`)
const fs = require(`fs`)
const _ = require(`lodash`)

const version = process.version
const verDigit = Number(version.match(/\d+/)[0])

if (verDigit < 4) {
  console.error(
    `Gatsby 1.0+ requires node.js v4 or higher (you have ${version}).
Upgrade node to the latest stable release.`
  )
  process.exit()
}

/*
  Get the locally installed version of gatsby/lib/bin/cli.js from the place
  where this program was executed.
*/
let localPath

try {
  localPath = require.resolve(`gatsby/dist/bin/cli.js`)
} catch (err) {
  useGlobalGatsby()
}

const useGlobalGatsby = function() {
  // Never use global install *except* for new and help commands
  if (!_.includes([`new`, `--help`], process.argv[2])) {
    console.error(
      `A local install of Gatsby was not found.
You should save Gatsby as a site dependency e.g. npm install --save gatsby`
    )
    process.exit()
  }

  require(`./bin/cli`)
}

if (localPath) {
  try {
    require(localPath)
  } catch (error) {
    console.error(`A local install of Gatsby exists but failed to load.`)
    console.error(error)
  }
}
