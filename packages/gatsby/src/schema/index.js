// const { mergeSchemas } = require(`graphql-tools`)
// const tracer = require(`opentracing`).globalTracer()

const { buildSchema, updateSchema } = require(`./schema`)
const { store } = require(`../redux`)

module.exports = async ({ parentSpan, update }) => {
  // const spanArgs = parentSpan ? { childOf: parentSpan } : {}
  // const span = tracer.startSpan(`build schema`, spanArgs)

  // const thirdPartySchemas = store.getState().thirdPartySchemas || []
  const schema = update ? await updateSchema() : await buildSchema()

  // span.finish()

  // FIXME: Disable schema stitching for now, because `mergeSchemas` is all over
  // the place -- and unfortunately breaks everything. Explain in more detail soon.
  // const schema = mergeSchemas({
  //   schemas: [gatsbySchema, ...thirdPartySchemas],
  // })

  store.dispatch({
    type: `SET_SCHEMA`,
    payload: schema,
  })
}
