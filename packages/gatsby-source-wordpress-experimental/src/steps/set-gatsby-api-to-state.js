import store from "~/store"
import { formatLogMessage } from "~/utils/format-log-message"

const setGatsbyApiToState = (helpers, pluginOptions) => {
  if (helpers.traceId === `refresh-createSchemaCustomization`) {
    return
  }

  //
  // add the plugin options and Gatsby API helpers to our store
  // to access them more easily
  store.dispatch.gatsbyApi.setState({
    helpers,
    pluginOptions,
  })

  if (!pluginOptions) {
    return
  }

  if (pluginOptions?.excludeFields?.length) {
    helpers.reporter.log(``)
    helpers.reporter.warn(
      formatLogMessage(
        // @todo
        `\n\nPlugin options excludeFields has been renamed to excludeFieldNames.\nBoth options work for now, but excludeFields will be removed in a future version\n(likely when we get to beta) in favour of excludeFieldNames.\n\n`
      )
    )
  }

  if (
    pluginOptions?.excludeFieldNames?.length ||
    // @todo remove excludeFields option in beta release since it's been renamed to excludeFieldNames
    pluginOptions?.excludeFields?.length
  ) {
    store.dispatch.remoteSchema.addFieldsToBlackList(
      pluginOptions.excludeFieldNames || pluginOptions.excludeFields
    )
  }
}

export { setGatsbyApiToState }
