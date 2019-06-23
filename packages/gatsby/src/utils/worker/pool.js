const Worker = require(`jest-worker`).default
const cpuCoreCount = require(`./cpu-core-count`)

const create = () =>
  new Worker(require.resolve(`./child`), {
    numWorkers: cpuCoreCount(true),
    forkOptions: {
      silent: false,
    },
  })

module.exports = {
  create,
}
