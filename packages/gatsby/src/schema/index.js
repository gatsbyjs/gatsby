const { mergeSchemas } = require(`graphql-tools`)
// const tracer = require(`opentracing`).globalTracer()

const { buildSchema, updateSchema } = require(`./schema`)
const { store } = require(`../redux`)

module.exports = async ({ parentSpan, update }) => {
  // const spanArgs = parentSpan ? { childOf: parentSpan } : {}
  // const span = tracer.startSpan(`build schema`, spanArgs)

  const thirdPartySchemas = store.getState().thirdPartySchemas || []
  const gatsbySchema = update ? await updateSchema() : await buildSchema()

  // span.finish()

  const schema = mergeSchemas({
    schemas: [gatsbySchema, ...thirdPartySchemas],
  })

  store.dispatch({
    type: `SET_SCHEMA`,
    payload: schema,
  })
}
