const Queue = require(`better-queue`)
const Promise = require(`bluebird`)
const request = require(`axios`)

const _defaults = {
  id: `url`,
}

/**
 * [handleQueue description]
 * @param  {[type]}   task [description]
 * @param  {Function} cb   [description]
 * @return {[type]}        [description]
 */
async function handleQueue(task, cb) {
  try {
    const response = await request(task)
    cb(null, response)
  } catch (err) {
    cb(err)
  }
}

/**
 * @typedef {Options}
 * @type {Object}
 * @see For a detailed descriptions of the options,
 *      see {@link https://www.npmjs.com/package/better-queue#full-documentation|better-queue on GitHub}
 */

/**
 * Run a series of requests tasks in a queue for better flow control
 *
 * @param  {Object[]} tasks  An array of Axios formatted request objects
 * @param  {Options}  opts   Options that will be given to better-queue
 * @return {Promise}         Resolves with the accumulated values from the tasks
 */
module.exports = function requestInQueue(tasks, opts = {}) {
  return new Promise((res, rej) => {
    const q = new Queue(handleQueue, { ..._defaults, ...opts })

    const taskMap = new Map(
      tasks.map(t => {
        q.push(t)
        return [t.url, null]
      })
    )

    q.on(`task_failed`, (id, err) => {
      rej(new Error(`${id} failed with err: ${err}`))
      q.destroy()
    })

    q.on(`task_finish`, (id, response) => {
      taskMap.set(id, response)
    })

    q.on(`drain`, () => res(Array.from(taskMap.values())))
  })
}
