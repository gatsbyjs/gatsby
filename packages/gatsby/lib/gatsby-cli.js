#!/usr/bin/env node
const path = require(`path`)
const fs = require(`fs`)

const version = process.version
const verDigit = Number(version.match(/\d+/)[0])

if (verDigit < 4) {
  console.error(`Gatsby 1.0+ requires node.js v4 or higher (you have ${version}).
Upgrade node to the latest stable release.`)
  process.exit()
}

console.log(`bin/gatsby: time since started: ${process.uptime()}`)

console.time(`initial loading`)
global.appStartTime = Date.now()

/*
  Get the locally installed version of gatsby/lib/bin/cli.js from the place
  where this program was executed.
*/
const cliFile = `dist/bin/cli.js`
const localPath = path.resolve(`node_modules/gatsby`, cliFile)

const useGlobalGatsby = function() {
  // Never use global install for new and help commands
  if ([`new`, `--help`].includes(process.argv[2])) {
    report.error(`A local install of Gatsby was not found.
You should save Gatsby as a site dependency e.g. npm install --save gatsby`)
    process.exit()
  }

  require(`./bin/cli`)
}

if (fs.existsSync(localPath)) {
  try {
    require(localPath)
    console.timeEnd(`initial loading`)
  } catch (error) {
    report.error(`A local install of Gatsby exists but failed to load.`)
    report.error(error)
  }
} else {
  useGlobalGatsby()
}
