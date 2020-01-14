import store from "../../store"

export const setGatsbyApiToState = (helpers, pluginOptions) => {
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
    store.dispatch.introspection.addFieldsToBlackList(
      pluginOptions.excludeFields
    )
  }
}
