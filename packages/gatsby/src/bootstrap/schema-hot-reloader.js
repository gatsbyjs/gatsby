const { debounce } = require(`lodash`)
const { emitter } = require(`../redux`)
const { rebuildWithTypes, getDirtyTypes } = require(`../schema`)
const report = require(`gatsby-cli/lib/reporter`)

// API_RUNNING_QUEUE_EMPTY could be emitted multiple types
// in a short period of time, so debounce seems reasonable
const maybeRebuildSchema = debounce(async () => {
  const dirtyTypes = getDirtyTypes()

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
