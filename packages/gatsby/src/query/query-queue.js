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
  const queue = new Queue(async (queryJob, callback) => {
    try {
      const result = await jobHandler({ queryJob })
      postHandler({ queryJob, result })
      callback(null, result)
    } catch (err) {
      console.log(`Error running queryRunner`, err)
      callback(err)
    }
  }, queueOptions)
  return queue
}

module.exports = {
  create,
}
