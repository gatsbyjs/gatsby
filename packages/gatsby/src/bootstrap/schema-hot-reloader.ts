import { debounce, cloneDeep } from "lodash"
import { emitter, store } from "../redux"
import { rebuild } from "../schema"
import { haveEqualFields } from "../schema/infer/inference-metadata"
import { updateStateAndRunQueries } from "../query/query-watcher"
import report from "gatsby-cli/lib/reporter"
import { IGatsbyState } from "../redux/types"

type TypeMap = IGatsbyState["inferenceMetadata"]["typeMap"]
type InferenceMetadata = IGatsbyState["inferenceMetadata"]

const inferredTypesChanged = (
  typeMap: TypeMap,
  prevTypeMap: TypeMap
): boolean =>
  Object.keys(typeMap).some(
    type =>
      typeMap[type].dirty && !haveEqualFields(typeMap[type], prevTypeMap[type])
  )

let lastMetadata: InferenceMetadata

// API_RUNNING_QUEUE_EMPTY could be emitted multiple types
// in a short period of time, so debounce seems reasonable
const maybeRebuildSchema = debounce(async (): Promise<void> => {
  const { inferenceMetadata } = store.getState()

  if (!inferredTypesChanged(inferenceMetadata.typeMap, lastMetadata.typeMap)) {
    return
  }

  const activity = report.activityTimer(`rebuild schema`)
  activity.start()
  await rebuild({ parentSpan: activity })
  await updateStateAndRunQueries(false, { parentSpan: activity })
  activity.end()
}, 1000)

function snapshotInferenceMetadata(): void {
  const { inferenceMetadata } = store.getState()
  lastMetadata = cloneDeep(inferenceMetadata)
}

export function bootstrapSchemaHotReloader(): void {
  // Snapshot inference metadata at the time of the last schema rebuild
  // (even if schema was rebuilt elsewhere)
  // Using the snapshot later to check if inferred types actually changed since the last rebuild
  snapshotInferenceMetadata()
  emitter.on(`SET_SCHEMA`, snapshotInferenceMetadata)

  startSchemaHotReloader()
}

export function startSchemaHotReloader(): void {
  // Listen for node changes outside of a regular sourceNodes API call,
  // e.g. markdown file update via watcher
  emitter.on(`API_RUNNING_QUEUE_EMPTY`, maybeRebuildSchema)
}

export function stopSchemaHotReloader(): void {
  emitter.off(`API_RUNNING_QUEUE_EMPTY`, maybeRebuildSchema)
  maybeRebuildSchema.cancel()
}
