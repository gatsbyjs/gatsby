/* @flow */

const tracer = require(`opentracing`).globalTracer()
const { store } = require(`../redux`)
const nodeStore = require(`../db/nodes`)
const { createSchemaComposer } = require(`./schema-composer`)
const { buildSchema, rebuildSchemaWithSitePage } = require(`./schema`)
const { builtInFieldExtensions } = require(`./extensions`)
const { builtInTypeDefinitions } = require(`./types/built-in-types`)
const { TypeConflictReporter } = require(`./infer/type-conflict-reporter`)

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
    const typeNames = [...types]
    // TODO: use async iterators when we switch to node>=10
    //  or better investigate if we can offload metadata building to worker/Jobs API
    //  and then feed the result into redux?
    const processNextType = () => {
      const typeName = typeNames.pop()
      store.dispatch({
        type: `BUILD_TYPE_METADATA`,
        payload: {
          typeName,
          nodes: nodeStore.getNodesByType(typeName),
        },
      })
      if (typeNames.length > 0) {
        // Give event-loop a break
        setTimeout(processNextType, 0)
      } else {
        resolve()
      }
    }
    processNextType()
  })

const build = async ({ parentSpan, fullMetadataBuild = true }) => {
  const spanArgs = parentSpan ? { childOf: parentSpan } : {}
  const span = tracer.startSpan(`build schema`, spanArgs)

  if (fullMetadataBuild) {
    // Build metadata for type inference and start updating it incrementally
    // except for SitePage type: we rebuild it in rebuildWithSitePage anyway
    // so it makes little sense to update it incrementally
    // (and those updates may have significant performance overhead)
    await buildInferenceMetadata({ types: nodeStore.getTypes() })
    store.dispatch({ type: `START_INCREMENTAL_INFERENCE` })
    store.dispatch({ type: `DISABLE_TYPE_INFERENCE`, payload: [`SitePage`] })
  }

  const {
    schemaCustomization: { thirdPartySchemas, printConfig },
    inferenceMetadata,
    config: { mapping: typeMapping },
  } = store.getState()

  const typeConflictReporter = new TypeConflictReporter()

  const fieldExtensions = getAllFieldExtensions()
  const schemaComposer = createSchemaComposer({ fieldExtensions })
  const schema = await buildSchema({
    schemaComposer,
    nodeStore,
    types: getAllTypeDefinitions(),
    fieldExtensions,
    thirdPartySchemas,
    typeMapping,
    printConfig,
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

const rebuildWithSitePage = async ({ parentSpan }) => {
  const spanArgs = parentSpan ? { childOf: parentSpan } : {}
  const span = tracer.startSpan(
    `rebuild schema with SitePage context`,
    spanArgs
  )
  await buildInferenceMetadata({ types: [`SitePage`] })

  // Disabling incremental inference for SitePage after the initial build
  // as it has a significant performance cost for zero benefits.
  // The only benefit is that schema rebuilds when SitePage.context structure changes.
  // (one can just restart `develop` in this case)
  store.dispatch({ type: `DISABLE_TYPE_INFERENCE`, payload: [`SitePage`] })

  const {
    schemaCustomization: { composer: schemaComposer },
    config: { mapping: typeMapping },
    inferenceMetadata,
  } = store.getState()

  const typeConflictReporter = new TypeConflictReporter()

  const schema = await rebuildSchemaWithSitePage({
    schemaComposer,
    nodeStore,
    fieldExtensions: getAllFieldExtensions(),
    typeMapping,
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

module.exports = {
  build,
  rebuild,
  rebuildWithSitePage,
}
