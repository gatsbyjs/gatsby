/* @flow */

const tracer = require(`opentracing`).globalTracer()
const { SchemaComposer } = require(`graphql-compose`)
const { store } = require(`../redux`)
const nodeStore = require(`../db/nodes`)
const { buildSchema, rebuildSchemaWithSitePage } = require(`./schema`)

module.exports.build = async ({ parentSpan }) => {
  const spanArgs = parentSpan ? { childOf: parentSpan } : {}
  const span = tracer.startSpan(`build schema`, spanArgs)

  let { thirdPartySchemas } = store.getState()

  const schemaComposer = new SchemaComposer()
  const schema = await buildSchema({
    schemaComposer,
    nodeStore,
    // typeDefs,
    // resolvers,
    thirdPartySchemas,
    // directives,
    parentSpan,
  })

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

module.exports.rebuildWithSitePage = async ({ parentSpan }) => {
  const spanArgs = parentSpan ? { childOf: parentSpan } : {}
  const span = tracer.startSpan(
    `rebuild schema with SitePage context`,
    spanArgs
  )
  let {
    schemaComposer: { composer: schemaComposer },
  } = store.getState()

  const schema = await rebuildSchemaWithSitePage({
    schemaComposer,
    nodeStore,
    // directives,
    parentSpan,
  })

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
