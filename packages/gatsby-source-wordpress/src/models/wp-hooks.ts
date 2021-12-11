import { createModel } from "@rematch/core"
import { RootModel } from "./index"

export interface INodeFilter {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter: (any) => any
  priority?: number
}

const wpHooks = createModel<RootModel>()({
  state: {
    nodeFilters: {},
  },

  reducers: {
    addNodeFilter(state, nodeFilter) {
      const { name, filter, priority = 10 } = nodeFilter

      if (!name || typeof filter === `undefined`) {
        return state
      }

      state.nodeFilters[nodeFilter.name] = [
        ...(state.nodeFilters?.[nodeFilter.name] || []),
        {
          name,
          filter,
          priority,
        },
      ]

      return state
    },
  },
})

export default wpHooks
