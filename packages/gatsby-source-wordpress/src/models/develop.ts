import { inPreviewMode } from "~/steps/preview"
export interface IDevelopState {
  refreshPollingIsPaused: boolean
}

export interface IDevelopReducers {
  pauseRefreshPolling: (state: IDevelopState) => IDevelopState
  resumeRefreshPolling: (state: IDevelopState) => IDevelopState
}

interface IPreviewStore {
  state: IDevelopState
  reducers: IDevelopReducers
}

const developStore: IPreviewStore = {
  state: {
    refreshPollingIsPaused: false,
  },

  reducers: {
    pauseRefreshPolling(state) {
      if (!inPreviewMode()) {
        state.refreshPollingIsPaused = true
      }

      return state
    },
    resumeRefreshPolling(state) {
      if (!inPreviewMode()) {
        state.refreshPollingIsPaused = false
      }

      return state
    },
  } as IDevelopReducers,
}

export default developStore
