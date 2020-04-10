const logger = {
  state: {
    entityCount: 0,
    typeCount: {},
  },

  reducers: {
    incrementTypeBy(state, payload) {
      const { type, count } = payload

      state.entityCount = state.entityCount + count

      const currentTypeCount = state.typeCount[type] || 0

      state.typeCount[type] = currentTypeCount + count

      return state
    },
  },
}

export default logger
