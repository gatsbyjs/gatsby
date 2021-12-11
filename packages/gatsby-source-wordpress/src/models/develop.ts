import { inPreviewMode } from "~/steps/preview"

import { createModel } from "@rematch/core"
import { RootModel } from "./index"

const developStore = createModel<RootModel>()({
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
})

export default developStore
