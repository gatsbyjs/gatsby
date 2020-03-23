import { debounce, cloneDeep } from "lodash"
import { emitter, store } from "../redux"
import { rebuild } from "../schema"
import { haveEqualFields } from "../schema/infer/inference-metadata"
import { updateStateAndRunQueries } from "../query/query-watcher"
import report from "gatsby-cli/lib/reporter"
import { IGatsbyState } from "../redux/types"

type TypeMap = IGatsbyState["inferenceMetadata"]["typeMap"]
type SchemaCustomization = IGatsbyState["schemaCustomization"]
type InferenceMetadata = IGatsbyState["inferenceMetadata"]

const inferredTypesChanged = (
  typeMap: TypeMap,
  prevTypeMap: TypeMap
): boolean =>
  Object.keys(typeMap).some(
    type =>
      typeMap[type].dirty && !haveEqualFields(typeMap[type], prevTypeMap[type])
  )

const schemaChanged = (
  schemaCustomization: SchemaCustomization,
  lastSchemaCustomization: SchemaCustomization
): boolean =>
  [`fieldExtensions`, `printConfig`, `thirdPartySchemas`, `types`].some(
    key => schemaCustomization[key] !== lastSchemaCustomization[key]
  )

let lastMetadata: InferenceMetadata
let lastSchemaCustomization: SchemaCustomization

// API_RUNNING_QUEUE_EMPTY could be emitted multiple types
// in a short period of time, so debounce seems reasonable
const maybeRebuildSchema = debounce(async (): Promise<void> => {
  const { inferenceMetadata, schemaCustomization } = store.getState()

  if (
    !inferredTypesChanged(inferenceMetadata.typeMap, lastMetadata.typeMap) &&
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

export const bootstrapSchemaHotReloader = (): void => {
  const { inferenceMetadata, schemaCustomization } = store.getState()
  lastMetadata = cloneDeep(inferenceMetadata)
  lastSchemaCustomization = schemaCustomization
  emitter.on(`API_RUNNING_QUEUE_EMPTY`, maybeRebuildSchema)
}
