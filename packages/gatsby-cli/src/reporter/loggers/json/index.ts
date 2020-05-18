import { onLogAction } from "../../redux/index"
import { ActionsUnion, ISetStatus } from "../../redux/types"
import stripAnsi from "strip-ansi"
import _ from "lodash"

const isStringPayload = (action: ActionsUnion): action is ISetStatus =>
  typeof action.payload === `string`

const sanitizeAction = (action: ActionsUnion): ActionsUnion => {
  if (isStringPayload(action)) {
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

export function initializeJSONLogger() {
  onLogAction((action: ActionsUnion) => {
    const sanitizedAction = sanitizeAction(action)

    process.stdout.write(JSON.stringify(sanitizedAction) + `\n`)
  })
}
