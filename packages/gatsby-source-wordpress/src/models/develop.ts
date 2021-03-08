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
      if (
        process.env.NODE_ENV === `development` &&
        !process.env.ENABLE_GATSBY_REFRESH_ENDPOINT
      ) {
        state.refreshPollingIsPaused = true
      }

      return state
    },
    resumeRefreshPolling(state) {
      if (
        process.env.NODE_ENV === `development` &&
        !process.env.ENABLE_GATSBY_REFRESH_ENDPOINT
      ) {
        state.refreshPollingIsPaused = false
      }

      return state
    },
  } as IDevelopReducers,
}

export default developStore
