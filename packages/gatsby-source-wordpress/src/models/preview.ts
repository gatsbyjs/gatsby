// `node` here is a Gatsby node
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OnPageCreatedCallback = (node: any) => Promise<void>

export interface IStoredPage {
  path: string
  updatedAt: number
}

export interface IPreviewState {
  nodePageCreatedCallbacks: {
    [nodeId: string]: OnPageCreatedCallback
  }
  nodeIdsToCreatedPages: {
    [nodeId: string]: {
      page: IStoredPage
    }
  }
  pagePathToNodeDependencyId: {
    [pageId: string]: {
      nodeId: string
    }
  }
}

export interface IPreviewReducers {
  subscribeToPagesCreatedFromNodeById: (
    state: IPreviewState,
    payload: {
      nodeId: string
      sendPreviewStatus: OnPageCreatedCallback
      modified: string
    }
  ) => IPreviewState
  unSubscribeToPagesCreatedFromNodeById: (
    state: IPreviewState,
    payload: {
      nodeId: string
    }
  ) => IPreviewState
  clearPreviewCallbacks: (state: IPreviewState) => IPreviewState
  saveNodePageState: (
    state: IPreviewState,
    payload: {
      nodeId: string
      page: IStoredPage
    }
  ) => IPreviewState
}

export interface IPreviewStore {
  state: IPreviewState
  reducers: IPreviewReducers
}

const previewStore: IPreviewStore = {
  state: {
    nodePageCreatedCallbacks: {},
    nodeIdsToCreatedPages: {},
    pagePathToNodeDependencyId: {},
  },

  reducers: {
    unSubscribeToPagesCreatedFromNodeById(state, { nodeId }) {
      if (state.nodePageCreatedCallbacks?.[nodeId]) {
        delete state.nodePageCreatedCallbacks[nodeId]
      }

      return state
    },

    subscribeToPagesCreatedFromNodeById(state, { nodeId, sendPreviewStatus }) {
      // save the callback for this nodeId
      // when a page is created from a node that has this id,
      // the callback will be invoked
      state.nodePageCreatedCallbacks[nodeId] = sendPreviewStatus

      return state
    },

    clearPreviewCallbacks(state) {
      state.nodePageCreatedCallbacks = {}

      return state
    },

    saveNodePageState(state, { page, nodeId }) {
      state.nodeIdsToCreatedPages[nodeId] = {
        page,
      }

      state.pagePathToNodeDependencyId[page.path] = {
        nodeId,
      }

      return state
    },
  } as IPreviewReducers,
}

export default previewStore
