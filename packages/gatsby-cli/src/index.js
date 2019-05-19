#!/usr/bin/env node

// babel-preset-env doesn't find this import if you
// use require() with backtick strings so use the es6 syntax
import "@babel/polyfill"

const createCli = require(`./create-cli`)
const report = require(`./reporter`)

const version = process.version
const verDigit = Number(version.match(/\d+/)[0])

const pkg = require(`../package.json`)
const updateNotifier = require(`update-notifier`)
// Check if update is available
updateNotifier({ pkg }).notify()

if (verDigit < 6) {
  report.panic(
    `Gatsby 1.0+ requires node.js v6 or higher (you have ${version}). \n` +
      `Upgrade node to the latest stable release.`
  )
}

process.on(`unhandledRejection`, error => {
  // This will exit the process in newer Node anyway so lets be consistent
  // across versions and crash
  report.panic(`UNHANDLED REJECTION`, error)
})

process.on(`uncaughtException`, error => {
  report.panic(`UNHANDLED EXCEPTION`, error)
})

createCli(process.argv)
