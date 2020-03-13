#!/usr/bin/env node

import "@babel/polyfill"
import os from "os"
import semver from "semver"
import util from "util"
import createCli from "./create-cli"
import report from "./reporter"
import pkg from "../package.json"
import updateNotifier from "update-notifier"
import { ensureWindowsDriveLetterIsUppercase } from "./util/ensure-windows-drive-letter-is-uppercase"

const useJsonLogger = process.argv.slice(2).some(arg => arg.includes(`json`))

if (useJsonLogger) {
  process.env.GATSBY_LOGGER = `json`
}

// Ensure stable runs on Windows when started from different shells (i.e. c:\dir vs C:\dir)
if (os.platform() === `win32`) {
  ensureWindowsDriveLetterIsUppercase()
}

// Check if update is available
updateNotifier({ pkg }).notify({ isGlobal: true })

const MIN_NODE_VERSION = `8.0.0`
const NEXT_MIN_NODE_VERSION = `10.13.0`

if (!semver.satisfies(process.version, `>=${MIN_NODE_VERSION}`)) {
  report.panic(
    report.stripIndent(`
      Gatsby requires Node.js ${MIN_NODE_VERSION} or higher (you have ${process.version}).
      Upgrade Node to the latest stable release: https://gatsby.dev/upgrading-node-js
    `)
  )
}

if (!semver.satisfies(process.version, `>=${NEXT_MIN_NODE_VERSION}`)) {
  report.warn(
    report.stripIndent(`
      Node.js ${process.version} has reached End of Life status on 31 December, 2019.
      Gatsby will only actively support ${NEXT_MIN_NODE_VERSION} or higher and drop support for Node 8 soon.
      Please upgrade Node.js to a currently active LTS release: https://gatsby.dev/upgrading-node-js
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
