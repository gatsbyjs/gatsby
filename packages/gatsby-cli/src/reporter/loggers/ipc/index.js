import { onLogAction } from "../../redux/index"
import stripAnsi from "strip-ansi"
import _ from "lodash"

const { Actions } = require(`../../constants`)

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

  process.send({
    type: Actions.LogAction,
    action: sanitizedAction,
  })
})
