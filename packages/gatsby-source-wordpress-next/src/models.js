const introspection = {
  state: {
    queries: {},
    fieldBlacklist: [
      // these aren't useful without authentication
      `revisions`,
      `themes`,
      `userRoles`,
      // this field is used to determine content changes in WP
      // no need to pull it into the Gatsby schema
      `actionMonitorActions`,
      // this causes an error on the WPGQL side so I'm removing it temporarily
      `postTypeInfo`,
    ],
  },

  reducers: {
    setState(state, payload) {
      state.queries = payload
      return state
    },
    addFieldsToBlackList(state, payload) {
      state.fieldBlacklist = [...state.fieldBlacklist, ...payload]
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
