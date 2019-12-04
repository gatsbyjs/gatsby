import store from "../store"

export const setApiHelpersToState = (helpers, pluginOptions) => {
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

  // set up plugin options
  if (pluginOptions.excludeFields) {
    store.dispatch.introspection.addFieldsToBlackList(
      pluginOptions.excludeFields
    )
  }
}
