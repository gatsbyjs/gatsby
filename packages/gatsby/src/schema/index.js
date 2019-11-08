/* @flow */

const tracer = require(`opentracing`).globalTracer()
const { store } = require(`../redux`)
const nodeStore = require(`../db/nodes`)
const { createSchemaComposer } = require(`./schema-composer`)
const { buildSchema, rebuildSchemaWithTypes } = require(`./schema`)
const { builtInFieldExtensions } = require(`./extensions`)
const { TypeConflictReporter } = require(`./infer/type-conflict-reporter`)

const build = async ({ parentSpan }) => {
  const spanArgs = parentSpan ? { childOf: parentSpan } : {}
  const span = tracer.startSpan(`build schema`, spanArgs)

  Object.keys(builtInFieldExtensions).forEach(name => {
    const extension = builtInFieldExtensions[name]
    store.dispatch({
      type: `CREATE_FIELD_EXTENSION`,
      payload: { name, extension },
    })
  })

  const {
    schemaCustomization: {
      thirdPartySchemas,
      types,
      fieldExtensions,
      printConfig,
    },
    inferenceMetadata,
    config: { mapping: typeMapping },
  } = store.getState()

  const typeConflictReporter = new TypeConflictReporter()

  // Ensure that user-defined types are processed last
  const sortedTypes = [
    ...types.filter(
      type => type.plugin && type.plugin.name !== `default-site-plugin`
    ),
    ...types.filter(
      type => !type.plugin || type.plugin.name === `default-site-plugin`
    ),
  ]

  const schemaComposer = createSchemaComposer({ fieldExtensions })
  const schema = await buildSchema({
    schemaComposer,
    nodeStore,
    types: sortedTypes,
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

const getDirtyTypes = () => {
  const { inferenceMetadata } = store.getState()

  return Object.keys(inferenceMetadata).filter(
    type => inferenceMetadata[type].dirty
  )
}

const rebuildWithTypes = async ({ typeNames, parentSpan }) => {
  const spanArgs = parentSpan ? { childOf: parentSpan } : {}
  const span = tracer.startSpan(
    `rebuild schema with SitePage context`,
    spanArgs
  )

  const {
    schemaCustomization: { composer: schemaComposer, fieldExtensions },
    config: { mapping: typeMapping },
    inferenceMetadata,
  } = store.getState()

  const typeConflictReporter = new TypeConflictReporter()

  const schema = await rebuildSchemaWithTypes({
    schemaComposer,
    nodeStore,
    fieldExtensions,
    typeMapping,
    typeConflictReporter,
    inferenceMetadata,
    typeNames,
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

const rebuildWithSitePage = async ({ parentSpan }) => {
  await rebuildWithTypes({ parentSpan, typeNames: [`SitePage`] })
}

module.exports = {
  build,
  rebuildWithSitePage,
  rebuildWithTypes,
  getDirtyTypes,
}
