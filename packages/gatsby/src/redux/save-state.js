const _ = require(`lodash`)
const report = require(`gatsby-cli/lib/reporter`)
const { captureEvent } = require(`gatsby-telemetry`)
const redux = require(`./`)

let saveInProgress = false
async function saveState() {
  if (saveInProgress) return
  saveInProgress = true

  const startTime = new Date()

  try {
    await redux.saveState()

    const duration = (new Date().getTime() - startTime.getTime()) / 1000

    captureEvent(`EVENT_NAME`, { name: `state_persistence`, duration })
  } catch (err) {
    report.warn(`Error persisting state: ${(err && err.message) || err}`)
  }

  saveInProgress = false
}

module.exports = {
  saveState,
}
