const { debounce } = require(`lodash`)
const { emitter, store } = require(`../redux`)
const { rebuildWithTypes } = require(`../schema`)
const report = require(`gatsby-cli/lib/reporter`)

// API_RUNNING_QUEUE_EMPTY could be emitted multiple types
// in a short period of time, so debounce seems reasonable
const maybeRebuildSchema = debounce(async () => {
  const { inferenceMetadata } = store.getState()

  const dirtyTypes = Object.keys(inferenceMetadata).filter(
    type => inferenceMetadata[type].dirty
  )

  if (!dirtyTypes.length) {
    return
  }

  report.info(`pending type changes: ${dirtyTypes.join(`, `)}`)

  const activity = report.activityTimer(`rebuild schema`)
  activity.start()
  await rebuildWithTypes({ parentSpan: activity, typeNames: dirtyTypes })
  activity.end()
}, 1000)

module.exports = () => {
  emitter.on(`API_RUNNING_QUEUE_EMPTY`, maybeRebuildSchema)
}
