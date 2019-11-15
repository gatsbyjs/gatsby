const { debounce, cloneDeep } = require(`lodash`)
const { emitter, store } = require(`../redux`)
const { rebuild } = require(`../schema`)
const { haveEqualFields } = require(`../schema/infer/inference-metadata`)
const { updateStateAndRunQueries } = require(`../query/query-watcher`)
const report = require(`gatsby-cli/lib/reporter`)

const inferredTypesChanged = (inferenceMetadata, prevInferenceMetadata) =>
  Object.keys(inferenceMetadata).filter(
    type =>
      inferenceMetadata[type].dirty &&
      !haveEqualFields(inferenceMetadata[type], prevInferenceMetadata[type])
  ).length > 0

const schemaChanged = (schemaCustomization, lastSchemaCustomization) =>
  [`fieldExtensions`, `printConfig`, `thirdPartySchemas`, `types`].some(
    key => schemaCustomization[key] !== lastSchemaCustomization[key]
  )

let lastMetadata
let lastSchemaCustomization

// API_RUNNING_QUEUE_EMPTY could be emitted multiple types
// in a short period of time, so debounce seems reasonable
const maybeRebuildSchema = debounce(async () => {
  const { inferenceMetadata, schemaCustomization } = store.getState()

  if (
    !inferredTypesChanged(inferenceMetadata, lastMetadata) &&
    !schemaChanged(schemaCustomization, lastSchemaCustomization)
  ) {
    return
  }

  const activity = report.activityTimer(`rebuild schema`)
  activity.start()
  lastMetadata = cloneDeep(inferenceMetadata)
  lastSchemaCustomization = schemaCustomization
  await rebuild({ parentSpan: activity })
  await updateStateAndRunQueries(false, { parentSpan: activity })
  activity.end()
}, 1000)

module.exports = () => {
  const { inferenceMetadata, schemaCustomization } = store.getState()
  lastMetadata = cloneDeep(inferenceMetadata)
  lastSchemaCustomization = schemaCustomization
  emitter.on(`API_RUNNING_QUEUE_EMPTY`, maybeRebuildSchema)
}
