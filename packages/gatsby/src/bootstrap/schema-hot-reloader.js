const { debounce, cloneDeep } = require(`lodash`)
const { emitter, store } = require(`../redux`)
const { rebuild } = require(`../schema`)
const { haveEqualFields } = require(`../schema/infer/inference-metadata`)
const { updateStateAndRunQueries } = require(`../query/query-watcher`)
const report = require(`gatsby-cli/lib/reporter`)

const getChangedTypes = (inferenceMetadata, prevInferenceMetadata) =>
  Object.keys(inferenceMetadata).filter(
    type =>
      inferenceMetadata[type].dirty &&
      !haveEqualFields(inferenceMetadata[type], prevInferenceMetadata[type])
  )

let lastMetadata
// API_RUNNING_QUEUE_EMPTY could be emitted multiple types
// in a short period of time, so debounce seems reasonable
const maybeRebuildSchema = debounce(async () => {
  const { inferenceMetadata } = store.getState()
  const changedTypes = getChangedTypes(inferenceMetadata, lastMetadata)

  if (!changedTypes.length) {
    return
  }

  const activity = report.activityTimer(`rebuild schema`)
  activity.start()
  lastMetadata = cloneDeep(inferenceMetadata)
  await rebuild({ parentSpan: activity })
  await updateStateAndRunQueries(false, { parentSpan: activity })
  activity.end()
}, 1000)

module.exports = () => {
  lastMetadata = cloneDeep(store.getState().inferenceMetadata)
  emitter.on(`API_RUNNING_QUEUE_EMPTY`, maybeRebuildSchema)
}
