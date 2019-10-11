import { onLogAction } from "../../redux/index"
import stripAnsi from "strip-ansi"
import _ from "lodash"

const { Actions } = require(`../../constants`)

onLogAction(action => {
  const sanitizedAction = {
    ...action,
    /* Payload can either be a String or an Object
     * See more at integration-tests/structured-logging/__tests__/to-do.js
     */
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
