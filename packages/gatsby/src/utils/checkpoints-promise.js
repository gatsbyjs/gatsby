// Wait for things to happen before continuing.
const Promise = require(`bluebird`)
const _ = require(`lodash`)

const { emitter } = require(`../redux`)

let waiters = []
emitter.on(`BOOTSTRAP_STAGE`, action => {
  const stage = action.payload.stage
  // Remove this stage from the waiters
  waiters = waiters.map(w => {
    const newWaiter = {
      resolve: w.resolve,
      events: _.difference(w.events, [stage]),
    }

    if (newWaiter.events.length === 0) {
      // Call resolve function then remove by returning undefined.
      newWaiter.resolve()
      return undefined
    } else {
      return newWaiter
    }
  })

  // Cleanup null entries
  waiters = _.filter(waiters)
})

module.exports = ({ events }) =>
  new Promise(resolve => {
    waiters.push({
      resolve,
      events,
    })
  })
