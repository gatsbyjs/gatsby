import { store } from "../redux"
import { getDataStore, getTypes } from "../datastore"
import { createSchemaComposer } from "./schema-composer"
import { buildSchema } from "./schema"
import { builtInFieldExtensions } from "./extensions"
import { builtInTypeDefinitions } from "./types/built-in-types"
import { TypeConflictReporter } from "./infer/type-conflict-reporter"
import { shouldPrintEngineSnapshot } from "../utils/engines-helpers"
import opentracing from "opentracing"
import type { DocumentNode } from "graphql"
import type { IGatsbyNode, IGatsbyPlugin } from "../internal"

const tracer = opentracing.globalTracer()

function getAllTypeDefinitions(): Array<
  | string
  | {
      typeOrTypeDef: DocumentNode
      plugin: IGatsbyPlugin
    }
  | {
      typeOrTypeDef: DocumentNode
      plugin: undefined
    }
> {
  const {
    schemaCustomization: { types },
  } = store.getState()

  const builtInTypes = builtInTypeDefinitions().map(typeDef => {
    return {
      typeOrTypeDef: typeDef,
      plugin: undefined,
    }
  })

  // Ensure that user-defined types are processed last
  return [
    ...builtInTypes,
    ...types.filter(type => {
      return (
        typeof type !== `string` &&
        type.plugin &&
        type.plugin.name !== `default-site-plugin`
      )
    }),
    ...types.filter(type => {
      return (
        typeof type === `string` ||
        !type.plugin ||
        type.plugin.name === `default-site-plugin`
      )
    }),
  ]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAllFieldExtensions(): any {
  const {
    schemaCustomization: { fieldExtensions: customFieldExtensions },
  } = store.getState()

  return {
    ...customFieldExtensions,
    ...builtInFieldExtensions,
  }
}

// Schema building requires metadata for type inference.
// Technically it means looping through all type nodes, analyzing node structure
// and then using this aggregated node structure in related GraphQL type.
// Actual logic for inference located in inferenceMetadata reducer and ./infer
// Here we just orchestrate the process via redux actions
function buildInferenceMetadata({ types }): Promise<unknown> {
  return new Promise(resolve => {
    if (!types || !types.length) {
      resolve(null)
      return
    }

    const typeNames = [...types]
    // TODO: use async iterators when we switch to node>=10
    //  or better investigate if we can offload metadata building to worker/Jobs API
    //  and then feed the result into redux?
    async function processNextType(): Promise<void> {
      const typeName = typeNames.pop()

      let processingNodes: Array<IGatsbyNode> = []
      let dispatchCount = 0

      function dispatchNodes(): Promise<null> {
        return new Promise(res => {
          store.dispatch({
            type: `BUILD_TYPE_METADATA`,
            payload: {
              typeName,
              // only clear metadata on the first chunk for this type
              clearExistingMetadata: dispatchCount++ === 0,
              nodes: processingNodes,
            },
          })
          globalThis.setImmediate(() => {
            // clear this array after BUILD_TYPE_METADATA reducer has synchronously run
            processingNodes = []
            // dont block the event loop. node may decide to free previous processingNodes array from memory if it needs to.
            setImmediate(() => {
              res(null)
            })
          })
        })
      }

      for (const node of getDataStore().iterateNodesByType(typeName)) {
        processingNodes.push(node)

        if (processingNodes.length > 1000) {
          await dispatchNodes()
        }
      }

      if (processingNodes.length > 0) {
        await dispatchNodes()
      }

      if (typeNames.length > 0) {
        // dont block the event loop
        globalThis.setImmediate(() => processNextType())
      } else {
        resolve(null)
      }
    }

    processNextType()
  })
}

export async function build({
  parentSpan,
  fullMetadataBuild = true,
}): Promise<void> {
  const spanArgs = parentSpan ? { childOf: parentSpan } : {}
  const span = tracer.startSpan(`build schema`, spanArgs)
  await getDataStore().ready()

  if (fullMetadataBuild) {
    // Build metadata for type inference and start updating it incrementally
    await buildInferenceMetadata({ types: getTypes() })
    store.dispatch({ type: `START_INCREMENTAL_INFERENCE` })
  }

  const {
    schemaCustomization: { thirdPartySchemas, printConfig },
    inferenceMetadata,
    config: { mapping: typeMapping },
    program: { directory },
  } = store.getState()

  const typeConflictReporter = new TypeConflictReporter()

  const enginePrintConfig = shouldPrintEngineSnapshot()
    ? {
        path: `${directory}/.cache/schema.gql`,
        rewrite: true,
      }
    : undefined

  const fieldExtensions = getAllFieldExtensions()
  const schemaComposer = createSchemaComposer({ fieldExtensions })
  const schema = await buildSchema({
    schemaComposer,
    types: getAllTypeDefinitions(),
    fieldExtensions,
    thirdPartySchemas,
    typeMapping,
    printConfig,
    enginePrintConfig,
    typeConflictReporter,
    inferenceMetadata,
    parentSpan,
  })

  typeConflictReporter.printConflicts()

  store.dispatch({
    type: `SET_SCHEMA_COMPOSER`,
    payload: schemaComposer,
  })
  store.dispatch({
    type: `SET_SCHEMA`,
    payload: schema,
  })

  span.finish()
}

export async function rebuild({ parentSpan }): Promise<void> {
  return await build({ parentSpan, fullMetadataBuild: false })
}
