const _ = require(`lodash`)
const report = require(`gatsby-cli/lib/reporter`)
const { captureEvent } = require(`gatsby-telemetry`)
const redux = require(`./`)
const { globalTracer } = require(`opentracing`)

const tracer = globalTracer()

let saveInProgress = false
async function saveState(buildSpan) {
  const span = tracer.startSpan(`redux.saveState`, { childOf: buildSpan })
  if (saveInProgress) {
    span.finish()
    return
  }

  saveInProgress = true

  const startTime = Date.now()

  try {
    redux.saveState()
  } catch (err) {
    report.warn(`Error persisting state: ${(err && err.message) || err}`)
  }

  try {
    const duration = (Date.now() - startTime) / 1000
    captureEvent(`INTERNAL_STATE_PERSISTENCE_DURATION`, {
      name: `Save Internal State`,
      duration: Math.round(duration),
    })
  } catch (err) {
    console.error(err)
  }

  saveInProgress = false
  span.finish()
}

module.exports = {
  saveState,
}
