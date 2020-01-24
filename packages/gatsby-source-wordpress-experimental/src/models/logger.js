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

export default logger
