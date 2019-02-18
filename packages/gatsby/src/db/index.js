const _ = require(`lodash`)
const redux = require(`../redux`)
const { emitter } = redux

// Even if we are using loki, we still include redux in the list of
// dbs since it still has pages, config, etc.
const dbs = [redux]
if (process.env.GATSBY_DB_NODES === `loki`) {
  dbs.push(require(`./loki`))
}

// calls `saveState()` on all DBs
function saveState() {
  for (const db of dbs) {
    db.saveState()
  }
}
const saveStateDebounced = _.debounce(saveState, 1000)

/**
 * Sets up listeners so that once bootstrap has finished, all
 * databases save their state to disk. If we're in `develop` mode,
 * then any new event triggers a debounced save as well.
 */
function startAutosave() {
  // During development, once bootstrap is finished, persist state on changes.
  let bootstrapFinished = false
  if (process.env.gatsby_executing_command === `develop`) {
    emitter.on(`BOOTSTRAP_FINISHED`, () => {
      bootstrapFinished = true
      saveState()
    })
    emitter.on(`*`, () => {
      if (bootstrapFinished) {
        saveStateDebounced()
      }
    })
  }

  // During builds, persist state once bootstrap has finished.
  if (process.env.gatsby_executing_command === `build`) {
    emitter.on(`BOOTSTRAP_FINISHED`, () => {
      saveState()
    })
  }
}

module.exports = {
  startAutosave,
}
