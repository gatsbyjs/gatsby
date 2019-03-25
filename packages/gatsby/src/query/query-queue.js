const Queue = require(`better-queue`)

const FastMemoryStore = require(`./better-queue-custom-store`)
const jobHandler = require(`./job-handler`)

const makeBaseOptions = () => {
  return {
    concurrent: 4,
    store: FastMemoryStore(),
  }
}

const defaultPostHandler = ({ queryJob, result }) => result

const create = ({
  postHandler = defaultPostHandler,
  betterQueueOptions = {},
} = {}) => {
  const queueOptions = { ...makeBaseOptions, ...betterQueueOptions }
  const queue = new Queue((queryJob, callback) => {
    jobHandler({ queryJob })
      .then(postHandler)
      .catch(e => console.log(`Error running queryRunner`, e))
      .then(result => callback(null, result), error => callback(error))
  }, queueOptions)
  return queue
}

module.exports = {
  create,
}
