/* eslint-env node */
import { isPlainObject } from "lodash"

import { onLogAction } from "../../redux/index"
import { Actions, LogLevels } from "../../constants"

import { stripAnsi } from '../strip-ansi'

onLogAction(function (action) {
  const sanitizedAction = {
    ...action,
    /* Payload can either be a String or an Object
     * See more at integration-tests/structured-logging/__tests__/to-do.js
     */
    payload: isPlainObject(action.payload)
      ? {
          ...action.payload,
          text: stripAnsi(action.payload.text),
          statusText: stripAnsi(action.payload.statusText),
        }
      : action.payload,
  }

  // we mutate sanitzedAction but this is already deep copy of action so we should be good
  if (sanitizedAction.type === Actions.Log) {
    // Don't emit Debug over IPC
    if ([LogLevels.Debug].includes(sanitizedAction.payload.level)) {
      return
    }
    // Override Success and Log types to Info over IPC
    if (
      [LogLevels.Success, LogLevels.Log].includes(sanitizedAction.payload.level)
    ) {
      sanitizedAction.payload.level = LogLevels.Info
    }
  }

  if (process && process.send) {
    process.send({
      type: Actions.LogAction,
      action: sanitizedAction,
    })
  }
})
