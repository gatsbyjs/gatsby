const { debounce } = require(`lodash`)
const { emitter, store } = require(`../redux`)
const { rebuild } = require(`../schema`)
const { updateStateAndRunQueries } = require(`../query/query-watcher`)
const report = require(`gatsby-cli/lib/reporter`)

const getDirtyTypes = () => {
  const { inferenceMetadata } = store.getState()

  return Object.keys(inferenceMetadata).filter(
    type => inferenceMetadata[type].dirty
  )
}

// API_RUNNING_QUEUE_EMPTY could be emitted multiple types
// in a short period of time, so debounce seems reasonable
const maybeRebuildSchema = debounce(async () => {
  const dirtyTypes = getDirtyTypes()

  if (!dirtyTypes.length) {
    return
  }

  const activity = report.activityTimer(`rebuild schema`)
  activity.start()
  await rebuild({ parentSpan: activity })
  await updateStateAndRunQueries(false, { parentSpan: activity })
  activity.end()
}, 1000)

module.exports = () => {
  emitter.on(`API_RUNNING_QUEUE_EMPTY`, maybeRebuildSchema)
}
