import { onLogAction } from "../../redux/index"
import { isPlainObject } from "lodash"

import { stripAnsi } from '../strip-ansi'

onLogAction(function(action): void {
  const sanitizedAction = {
    ...action,
    payload: isPlainObject(action.payload)
      ? {
          ...action.payload,
          text: stripAnsi(action.payload.text),
          statusText: stripAnsi(action.payload.statusText),
        }
      : action.payload,
  }

  process.stdout.write(JSON.stringify(sanitizedAction) + `\n`)
})
