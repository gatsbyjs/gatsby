let websocket
let isInitialised = false
let results = {}

module.exports = {
  init: server => {
    websocket = require(`socket.io`)(server)
    websocket.on(`connection`, s => {
      s.emit(`queryResult`, results)
    })
    isInitialised = true
  },
  instance: () => isInitialised && websocket,
  pushResults: result => {
    Object.assign(results, result)
  },
}
