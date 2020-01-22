import merge from "lodash/merge"

// @todo split models up into different files

const introspection = {
  state: {
    // @todo rename queries to nodeQueries
    queries: {},
    nonNodeQuery: null,
    introspectionData: null,
    schemaWasChanged: null,
    typeMap: null,
    nodeListFilter: field => field.name === `nodes`,
    ingestibles: {
      nodeListRootFields: null,
      nodeInterfaceTypes: null,
      nonNodeRootFields: [],
    },
    fetchedTypes: new Map(),
    fieldBlacklist: [
      // these aren't useful without authentication
      // @todo make this dynamic when authentication is added
      `revisions`,
      `edges`,
      `isWpGatsby`,
      // the next two cause an error on the WPGQL side so I'm removing them temporarily
      // https://github.com/wp-graphql/wp-graphql/issues/848
      `postTypeInfo`,
      `connectedPostTypes`,
      // we don't need auth fields
      `isJwtAuthSecretRevoked`,
      `isRestricted`,
      `jwtAuthExpiration`,
      `jwtAuthToken`,
      `jwtRefreshToken`,
      `jwtUserSecret`,
    ],
    fieldAliases: {
      parent: `wpParent`,
      children: `wpChildren`,
      internal: `wpInternal`,
      plugin: `wpPlugin`,
      actionOptions: `wpActionOptions`,
    },
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

    addFetchedType(state, type) {
      const key = type.name || type.ofType.name

      if (!key) {
        return state
      }

      state.fetchedTypes.set(key, type)

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

    addImgMatches(state, matches) {
      matches.forEach(match =>
        match.subMatches.forEach(subMatch => state.urls.add(subMatch))
      )

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
