import { createModel } from "@rematch/core"
import { IRootModel } from "."

export interface INodeFilter {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter: (any) => any
  priority?: number
}

export interface IWPHooksState {
  nodeFilters: { [name: string]: Array<INodeFilter> }
}

const wpHooks = createModel<IRootModel>()({
  state: {
    nodeFilters: {},
  },

  reducers: {
    addNodeFilter(
      state: IWPHooksState,
      nodeFilter: INodeFilter
    ): IWPHooksState {
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
  effects: () => {
    return {}
  },
})

export default wpHooks
