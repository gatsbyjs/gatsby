import { onLogAction } from "../../redux/index"
import { ActionsUnion } from "../../redux/types"
import stripAnsi from "strip-ansi"
import _ from "lodash"

onLogAction((action: ActionsUnion) => {
  const sanitizedAction = {
    ...action,
    payload:
      typeof action.payload !== `string`
        ? `text` in action.payload && `statusText` in action.payload
          ? {
              ...action.payload,
              text: action.payload.text && stripAnsi(action.payload.text),
              statusText:
                action.payload.statusText &&
                stripAnsi(action.payload.statusText),
            }
          : {
              ...action.payload,
            }
        : action.payload,
  }

  process.stdout.write(JSON.stringify(sanitizedAction) + `\n`)
})
