import { init } from "@rematch/core"
import immerPlugin from "@rematch/immer"

const introspectionModel = {
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

const models = {
  introspection: introspectionModel,
}

const store = init({
  models,
  plugins: [immerPlugin()],
})

export default store
