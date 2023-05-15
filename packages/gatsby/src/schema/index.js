/* @flow */

const tracer = require(`opentracing`).globalTracer()
const { store } = require(`../redux`)
const { getDataStore, getTypes } = require(`../datastore`)
const { createSchemaComposer } = require(`./schema-composer`)
const { buildSchema } = require(`./schema`)
const { builtInFieldExtensions } = require(`./extensions`)
const { builtInTypeDefinitions } = require(`./types/built-in-types`)
const { TypeConflictReporter } = require(`./infer/type-conflict-reporter`)
const { shouldPrintEngineSnapshot } = require(`../utils/engines-helpers`)
const gc = require(`expose-gc/function`)

const getAllTypeDefinitions = () => {
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
    ...types.filter(
      type => type.plugin && type.plugin.name !== `default-site-plugin`
    ),
    ...types.filter(
      type => !type.plugin || type.plugin.name === `default-site-plugin`
    ),
  ]
}

const getAllFieldExtensions = () => {
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
const buildInferenceMetadata = ({ types }) =>
  new Promise(resolve => {
    if (!types || !types.length) {
      resolve()
      return
    }

    let nodesSeenCount = 0
    let processedNodesCount = 0
    let dispatchSize = 1000
    const forceGcCount = 0

    const typeNames = [...types]
    // TODO: use async iterators when we switch to node>=10
    //  or better investigate if we can offload metadata building to worker/Jobs API
    //  and then feed the result into redux?
    const processNextType = async () => {
      const typeName = typeNames.pop()

      let processingNodes = []
      let dispatchCount = 0
      function dispatchNodes() {
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
          setImmediate(() => {
            processedNodesCount += processingNodes.length

            const initialDispatchSize = dispatchSize

            // decrease dispatch size for large sites to prevent
            // OOMs during inference
            if (processedNodesCount >= 1000) {
              dispatchSize = 500
            }
            if (processedNodesCount >= 5000) {
              dispatchSize = 250
            }
            if (processedNodesCount >= 10000) {
              dispatchSize = 100
            }
            if (processedNodesCount >= 100000) {
              dispatchSize = 50
            }
            if (processedNodesCount >= 1000000) {
              dispatchSize = 25
            }

            if (initialDispatchSize !== dispatchSize) {
              console.info(
                `[gatsby] Decreasing inference dispatch size from ${initialDispatchSize} to ${dispatchSize} for large site. Processed ${processedNodesCount} nodes.`
              )
            }
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

        if (nodesSeenCount++ > 100000 && nodesSeenCount % 10000 === 0) {
          console.info(`[gatsby] forcing garbage collection #${forceGcCount++}`)
          gc()
        }

        if (processingNodes.length >= dispatchSize) {
          await dispatchNodes()
        }
      }

      if (processingNodes.length > 0) {
        await dispatchNodes()
      }

      if (typeNames.length > 0) {
        // dont block the event loop
        setImmediate(() => processNextType())
      } else {
        if (forceGcCount > 0) {
          console.info(
            `[gatsby] Finished building inference metadata. Forced garbage collection ${forceGcCount} times.`
          )
        }
        resolve()
      }
    }
    processNextType()
  })

const build = async ({ parentSpan, fullMetadataBuild = true }) => {
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

const rebuild = async ({ parentSpan }) =>
  await build({ parentSpan, fullMetadataBuild: false })

module.exports = {
  build,
  rebuild,
}
