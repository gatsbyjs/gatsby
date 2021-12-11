import { formatLogMessage } from "~/utils/format-log-message"

import { createModel } from "@rematch/core"
import { RootModel } from "./index"

const logger = createModel<RootModel>()({
  state: {
    entityCount: 0,
    typeCount: {},
    activityTimers: {},
  },

  reducers: {
    incrementActivityTimer(state, { typeName, by, action = `fetched` }) {
      const logger = state.activityTimers[typeName]

      if (!logger) {
        return state
      }

      if (typeof by === `number`) {
        logger.count += by
        state.entityCount += by
      }

      logger.activity.setStatus(`${action} ${logger.count}`)

      return state
    },

    stopActivityTimer(state, { typeName, action = `fetched` }) {
      const logger = state.activityTimers[typeName]

      if (logger.count === 0) {
        logger.activity.setStatus(`${action} 0`)
      }

      logger.activity.end()

      return state
    },

    createActivityTimer(state, { typeName, reporter, pluginOptions }) {
      if (state.activityTimers[typeName]) {
        return state
      }

      const typeActivityTimer = {
        count: 0,
        activity: reporter.activityTimer(
          formatLogMessage(typeName, {
            useVerboseStyle: pluginOptions.verbose,
          })
        ),
      }

      if (pluginOptions.verbose) {
        typeActivityTimer.activity.start()
      }

      state.activityTimers[typeName] = typeActivityTimer

      return state
    },
  },
})

export default logger
