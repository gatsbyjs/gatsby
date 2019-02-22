const Telemetry = require(`./telemetry`)
const instance = new Telemetry()

const flush = _ => {
  instance
    .sendEvents()
    .then(e => {
      // ignore
    })
    .catch(e => {
      // ignore
    })
}

flush()
