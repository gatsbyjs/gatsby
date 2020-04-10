const apiRunnerNode = require(`./api-runner-node`)
const { store } = require(`../redux`)

module.exports = async ({ refresh = false, webhookBody = {}, parentSpan }) => {
  if (refresh) {
    store.dispatch({ type: `CLEAR_SCHEMA_CUSTOMIZATION` })
  }
  await apiRunnerNode(`createSchemaCustomization`, {
    parentSpan,
    webhookBody,
    traceId: !refresh
      ? `initial-createSchemaCustomization`
      : `refresh-createSchemaCustomization`,
  })
}
