import { createModel } from "@rematch/core"
import { inPreviewMode } from "~/steps/preview"
import { IRootModel } from "."

const developStore = createModel<IRootModel>()({
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
  },
  effects: () => {
    return {}
  },
})

export default developStore
