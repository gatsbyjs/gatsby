import { onLogAction } from "../../redux/index"
import { ActionsUnion, ISetStatus } from "../../redux/types"
import stripAnsi from "strip-ansi"
import { cloneDeep } from "lodash"

const isStringPayload = (action: ActionsUnion): action is ISetStatus =>
  typeof action.payload === `string`

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

export function initializeJSONLogger(): void {
  onLogAction((action: ActionsUnion) => {
    const sanitizedAction = sanitizeAction(action)

    process.stdout.write(JSON.stringify(sanitizedAction) + `\n`)
  })
}
