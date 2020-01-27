import merge from "lodash/merge"

const gatsbyApi = {
  state: {
    helpers: {},
    pluginOptions: {
      url: null,
      verbose: false,
      debug: {
        graphql: {
          showQueryOnError: false,
          showQueryVarsOnError: false,
          copyQueryOnError: false,
          panicOnError: false,
        },
      },
      schema: {
        queryDepth: 10,
        typePrefix: `Wp`,
      },
      type: {
        MediaItem: {
          onlyFetchIfReferenced: false,
        },
        ContentNode: {
          nodeInterface: true,
        },
      },
    },
  },

  reducers: {
    setState(state, payload) {
      return merge(state, payload)
    },
  },
}

export default gatsbyApi
