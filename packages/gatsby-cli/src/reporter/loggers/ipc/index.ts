import { onLogAction } from "../../redux/index"
import { ISetStatus, ActionsUnion } from "../../redux/types"
import { Actions, LogLevels } from "../../constants"
import stripAnsi from "strip-ansi"

const isISetStatus = (action: ActionsUnion): action is ISetStatus =>
  typeof action.payload === `string`

/**
 * Payload can either be a String or an Object
 * See more at integration-tests/structured-logging/__tests__/to-do.js
 */
const sanitizeAction = (action: ActionsUnion): ActionsUnion => {
  if (isISetStatus(action)) {
    return action
  }

  if (`text` in action.payload && action.payload.text) {
    action.payload.text = stripAnsi(action.payload.text)
  }
  if (`statusText` in action.payload && action.payload.statusText) {
    action.payload.statusText = stripAnsi(action.payload.statusText)
  }

  return action
}

export const ipcLogger = (): void => {
  onLogAction((action: ActionsUnion) => {
    if (!process.send) return

    const sanitizedAction = sanitizeAction(action)

    // we mutate sanitizedAction but this is already deep copy of action so we should be good
    if (sanitizedAction.type === Actions.Log) {
      // Don't emit Debug over IPC
      if (
        [LogLevels.Debug].includes(sanitizedAction.payload.level as LogLevels)
      ) {
        return
      }
      // Override Success and Log types to Info over IPC
      if (
        [LogLevels.Success, LogLevels.Log].includes(
          sanitizedAction.payload.level as LogLevels
        )
      ) {
        sanitizedAction.payload.level = LogLevels.Info
      }
    }

    process.send({
      type: Actions.LogAction,
      action: sanitizedAction,
    })
  })
}
