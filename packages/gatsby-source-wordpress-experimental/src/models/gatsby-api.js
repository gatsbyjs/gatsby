import merge from "lodash/merge"

const gatsbyApi = {
  state: {
    helpers: {},
    pluginOptions: {
      verbose: false,
      debug: {
        graphql: {
          showQueryOnError: true,
        },
      },
      schema: {
        queryDepth: 10,
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
