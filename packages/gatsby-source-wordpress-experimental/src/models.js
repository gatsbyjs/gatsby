const introspection = {
  state: {
    queries: {},
    introspectionData: null,
    schemaWasChanged: null,
    fieldBlacklist: [
      // these aren't useful without authentication
      `revisions`,
      `themes`,
      `userRoles`,
      // this field is used to determine content changes in WP
      // no need to pull it into the Gatsby schema
      `actionMonitorActions`,
      `edges`,
      // the next two cause an error on the WPGQL side so I'm removing them temporarily
      // https://github.com/wp-graphql/wp-graphql/issues/848
      `postTypeInfo`,
      `connectedPostTypes`,
    ],
  },

  reducers: {
    setSchemaWasChanged(state, payload) {
      state.schemaWasChanged = !!payload

      return state
    },

    setQueries(state, payload) {
      state.queries = payload
      return state
    },

    addFieldsToBlackList(state, payload) {
      state.fieldBlacklist = [...state.fieldBlacklist, ...payload]
      return state
    },

    setState(state, payload) {
      state = {
        ...state,
        ...payload,
      }

      return state
    },
  },
}

const logger = {
  state: {
    entityCount: 0,
  },

  reducers: {
    incrementBy(state, payload) {
      state.entityCount = state.entityCount + payload
      return state
    },
  },
}

const gatsbyApi = {
  state: {
    helpers: {},
    pluginOptions: {
      verbose: false,
    },
  },

  reducers: {
    setState(_, payload) {
      return payload
    },
  },
}

const imageNodes = {
  state: {
    urls: new Set(),
    nodeMetaByUrl: {},
    nodeIds: [],
  },

  reducers: {
    setNodeIds(_, payload) {
      return {
        nodeIds: payload,
      }
    },

    pushNodeMeta(state, { id, sourceUrl, modifiedGmt }) {
      state.nodeIds.push(id)
      state.nodeMetaByUrl[sourceUrl] = {
        id,
        modifiedGmt,
      }

      return state
    },

    addUrlMatches(state, matches) {
      matches.forEach(({ match }) => state.urls.add(match))

      return state
    },
  },
}

export default {
  introspection,
  gatsbyApi,
  logger,
  imageNodes,
}
