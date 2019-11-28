const introspection = {
  state: {
    queries: {},
  },
  reducers: {
    setQueries(state, payload) {
      state.queries = payload
      return state
    },
  },
}

export default {
  introspection,
}
