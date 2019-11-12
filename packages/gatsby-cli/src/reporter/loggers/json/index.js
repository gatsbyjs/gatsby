import { onLogAction } from "../../redux/index"
import stripAnsi from "strip-ansi"
import _ from "lodash"

onLogAction(action => {
  const sanitizedAction = {
    ...action,
    payload: _.isPlainObject(action.payload)
      ? {
          ...action.payload,
          text: stripAnsi(action.payload.text),
          statusText: stripAnsi(action.payload.statusText),
        }
      : action.payload,
  }

  process.stdout.write(JSON.stringify(sanitizedAction) + `\n`)
})
