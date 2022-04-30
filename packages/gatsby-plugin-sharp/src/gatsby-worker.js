const path = require(`path`)
const queue = require(`async/queue`)
const { cpuCoreCount } = require(`gatsby-core-utils/cpu-core-count`)
const { processFile } = require(`./process-file`)

exports.IMAGE_PROCESSING_JOB_NAME = `IMAGE_PROCESSING`

/** @typedef {import('./process-file').TransformArgs} TransformArgs */

/**
 * @typedef WorkerInput
 * @property {string} contentDigest
 * @property {{outputPath: string, args: TransformArgs[]}} operations
 * @property {object} pluginOptions
 */

/**
 * the queue concurrency is 1 as we only want to transform 1 file at a time.
 * @param {(job: WorkerInput, callback: Function) => undefined} task
 */
const q = queue(
  async ({ inputPaths, outputDir, args }) =>
    processFile(
      inputPaths[0].path,
      args.operations.map(operation => {
        return {
          outputPath: path.join(outputDir, operation.outputPath),
          args: operation.args,
        }
      }),
      args.pluginOptions
    ),
  // When inside query workers, we only want to use the current core
  process.env.GATSBY_WORKER_POOL_WORKER ? 1 : Math.max(1, cpuCoreCount() - 1)
)

/**
 * @param {{inputPaths: string[], outputDir: string, args: WorkerInput}} args
 * @return Promise
 */
exports.IMAGE_PROCESSING = ({ inputPaths, outputDir, args }) => {
  if (args.isLazy) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    q.push({ inputPaths, outputDir, args }, function (err) {
      if (err) {
        return reject(err)
      }

      return resolve()
    })
  })
}
