import store from "~/store"

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

  if (pluginOptions.excludeFields && pluginOptions.excludeFields.length) {
    store.dispatch.remoteSchema.addFieldsToBlackList(
      pluginOptions.excludeFields
    )
  }
}

export { setGatsbyApiToState }
