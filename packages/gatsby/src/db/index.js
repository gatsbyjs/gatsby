const _ = require(`lodash`)
const redux = require(`../redux`)
const { store, emitter } = redux
const { actions } = require(`../redux/actions`)

const { dispatch } = store
const { log } = actions

// Even if we are using loki, we still include redux in the list of
// dbs since it still has pages, config, etc.
const dbs = [redux]
if (process.env.GATSBY_DB_NODES === `loki`) {
  dbs.push(require(`./loki`))
}

// calls `saveState()` on all DBs
let saveInProgress = false
async function saveState() {
  if (saveInProgress) return
  saveInProgress = true

  try {
    await Promise.all(dbs.map(db => db.saveState()))
  } catch (err) {
    const message = `Error persisting state: ${(err && err.message) || err}`
    dispatch(log({ message, type: `warn` }))
  }

  saveInProgress = false
}
const saveStateDebounced = _.debounce(saveState, 1000)

/**
 * Starts listening to redux actions and triggers a database save to
 * disk upon any action (debounced to every 1 second)
 */
function startAutosave() {
  saveStateDebounced()
  emitter.on(`*`, () => saveStateDebounced())
}

module.exports = {
  startAutosave,
  saveState,
}
