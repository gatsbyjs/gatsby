const introspection = {
  state: {
    queries: {},
  },
  reducers: {
    setState(state, payload) {
      state.queries = payload
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

export default {
  introspection,
  gatsbyApi,
  logger,
}
