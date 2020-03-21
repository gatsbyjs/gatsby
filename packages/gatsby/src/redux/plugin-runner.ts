// Invoke plugins for certain actions.

import { emitter } from "./index"
import apiRunnerNode from "../utils/api-runner-node"

emitter.on(`CREATE_PAGE`, action => {
  const page = action.payload
  apiRunnerNode(
    `onCreatePage`,
    { page, traceId: action.traceId, parentSpan: action.parentSpan },
    { pluginSource: action.plugin.name, activity: action.activity }
  )
})
