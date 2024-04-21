import { createModel } from "@rematch/core"
import type { IRootModel } from "."

export type INodeFilter = {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter: (arg: any) => any
  priority?: number
}

export type IWPHooksState = {
  nodeFilters: { [name: string]: Array<INodeFilter> }
}

const wpHooks = createModel<IRootModel>()({
  state: {
    nodeFilters: {},
  },

  reducers: {
    addNodeFilter(
      state: IWPHooksState,
      nodeFilter: INodeFilter,
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
