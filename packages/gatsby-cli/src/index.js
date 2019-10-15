#!/usr/bin/env node

// babel-preset-env doesn't find this import if you
// use require() with backtick strings so use the es6 syntax
import "@babel/polyfill"
const semver = require(`semver`)
const util = require(`util`)

const createCli = require(`./create-cli`)
const report = require(`./reporter`)

const pkg = require(`../package.json`)
const updateNotifier = require(`update-notifier`)
// Check if update is available
updateNotifier({ pkg }).notify({ isGlobal: true })

const MIN_NODE_VERSION = `>=8.0.0`

if (!semver.satisfies(process.version, MIN_NODE_VERSION)) {
  report.panic(
    report.stripIndent(`
      Gatsby requires Node.js v8 or higher (you have ${process.version}).
      Upgrade Node to the latest stable release: https://gatsby.dev/upgrading-node-js
    `)
  )
}

process.on(`unhandledRejection`, reason => {
  // This will exit the process in newer Node anyway so lets be consistent
  // across versions and crash

  // reason can be anything, it can be a message, an object, ANYTHING!
  // we convert it to an error object so we don't crash on structured error validation
  if (!(reason instanceof Error)) {
    reason = new Error(util.format(reason))
  }

  report.panic(`UNHANDLED REJECTION`, reason)
})

process.on(`uncaughtException`, error => {
  report.panic(`UNHANDLED EXCEPTION`, error)
})

createCli(process.argv)
