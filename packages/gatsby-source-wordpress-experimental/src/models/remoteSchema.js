const remoteSchema = {
  state: {
    // @todo rename queries to nodeQueries
    nodeQueries: {},
    nonNodeQuery: null,
    introspectionData: null,
    schemaWasChanged: null,
    schemaWasCheckedForChanges: false,
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
    // @todo make this a plugin option
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
      state.schemaWasCheckedForChanges = true

      return state
    },

    setQueries(state, payload) {
      state.nodeQueries = payload
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

export default remoteSchema
