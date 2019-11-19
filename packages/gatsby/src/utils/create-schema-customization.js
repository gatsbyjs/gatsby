const apiRunnerNode = require(`./api-runner-node`)
const { store } = require(`../redux`)

module.exports = async ({ refresh = false, parentSpan }) => {
  if (refresh) {
    store.dispatch({ type: `CLEAR_SCHEMA_CUSTOMIZATION` })
  }
  await apiRunnerNode(`createSchemaCustomization`, {
    parentSpan,
    traceId: !refresh
      ? `initial-createSchemaCustomization`
      : `refresh-createSchemaCustomization`,
  })
}
