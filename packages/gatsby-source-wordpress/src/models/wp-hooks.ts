export interface INodeFilter {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter: (any) => any
  priority?: number
}

export interface IWPHooksState {
  nodeFilters: { [name: string]: Array<INodeFilter> }
}

export interface IWPHooksReducers {
  addNodeFilter: (state: IWPHooksState, payload: INodeFilter) => IWPHooksState
}

export interface IWPHooksStore {
  state: IWPHooksState
  reducers: IWPHooksReducers
}

const wpHooks: IWPHooksStore = {
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
}

export default wpHooks
