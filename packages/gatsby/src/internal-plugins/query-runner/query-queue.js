const Queue = require(`better-queue`)

const queryRunner = require(`./query-runner`)
const { store } = require(`../../redux`)

const queue = new Queue(
  (plObj, callback) => {
    const state = store.getState()
    return queryRunner(plObj, state.components[plObj.component]).then(
      result => callback(null, result),
      error => callback(error)
    )
  },
  { concurrent: 4 }
)

module.exports = queue
