import { onLogAction } from "../../redux/index"
import { ISetStatus, ActionsUnion } from "../../redux/types"
import { Actions, LogLevels } from "../../constants"
import stripAnsi from "strip-ansi"
import { cloneDeep } from "lodash"

const isStringPayload = (action: ActionsUnion): action is ISetStatus =>
  typeof action.payload === `string`

/**
 * Payload can either be a String or an Object
 * See more at integration-tests/structured-logging/__tests__/to-do.js
 */
const sanitizeAction = (action: ActionsUnion): ActionsUnion => {
  const copiedAction = cloneDeep(action)

  if (isStringPayload(copiedAction)) {
    return copiedAction
  }

  if (`text` in copiedAction.payload && copiedAction.payload.text) {
    copiedAction.payload.text = stripAnsi(copiedAction.payload.text)
  }
  if (`statusText` in copiedAction.payload && copiedAction.payload.statusText) {
    copiedAction.payload.statusText = stripAnsi(copiedAction.payload.statusText)
  }

  return copiedAction
}

export const initializeIPCLogger = (): void => {
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

    // disable structured logs IPC for now, as jest-worker doesn't play nice with it
    if (!process.env.JEST_WORKER_ID) {
      process.send({
        type: Actions.LogAction,
        action: sanitizedAction,
      })
    }
  })
}
