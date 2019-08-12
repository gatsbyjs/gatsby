import { onLogAaction } from "../../redux/index"
import stripAnsi from "strip-ansi"
import _ from "lodash"

const reporterActions = require(`../../redux/actions`)
const { getLocalGatsbyVersion } = require(`../../../util/version`)

process.send({
  type: `VERSION`,
  gatsby: getLocalGatsbyVersion(),
})

onLogAaction(action => {
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
    type: `LOG_ACTION`,
    action: sanitizedAction,
  })
})
