const lock = require(`lock`).Lock
const lockInstance = lock()

module.exports = resources =>
  new Promise(resolve =>
    lockInstance(resources, release => {
      const releaseLock = release(() => {})
      resolve(releaseLock)
    })
  )
