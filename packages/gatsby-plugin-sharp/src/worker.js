const queue = require(`async/queue`)
const { processFile } = require(`./process-file`)

/** @typedef {import('./process-file').TransformArgs} TransformArgs */

/**
 * @typedef WorkerInput
 * @property {string} inputPath the file path to transform
 * @property {string} contentDigest
 * @property {object} pluginOptions
 * @property {{outputPath: string, transforms: TransformArgs[]}} transforms
 */

/**
 * the queue concurrency is 1 as we only want to transform 1 file at a time.
 * @param {(job: WorkerInput, callback: Function) => undefined} task
 */
const q = queue((job, callback) => {
  Promise.all(
    processFile(
      job.inputPath,
      job.contentDigest,
      job.transforms.map(transform => {
        return {
          outputPath: transform.outputPath,
          args: transform.transforms,
        }
      }),
      job.pluginOptions
    )
  )
    .then(() => callback())
    .catch(err => callback(err))
}, 1)

/**
 * @param {WorkerInput} job
 */
module.exports = job =>
  new Promise((resolve, reject) => {
    q.push(job, function(err) {
      if (err) {
        return reject(err)
      }

      return resolve()
    })
  })
