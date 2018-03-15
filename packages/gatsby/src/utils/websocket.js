let websocket
let isInitialised = false
let results = {}

module.exports = {
  init: server => {
    websocket = require(`socket.io`)(server)
    isInitialised = true
  },
  instance: () => isInitialised && websocket,
  pushResult: result => {
    Object.assign(results, result)
  },
  flushResults: () => results,
}
