const path = require(`path`)
const queue = require(`async/queue`)
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
  async ({ inputPaths, outputDir, relativeToPublicPath, args }) =>
    Promise.all(
      processFile(
        inputPaths[0].path,
        args.operations.map(operation => {
          return {
            outputPath: path.join(outputDir, operation.outputPath),
            outputPathRelativeToPublic: path.join(
              relativeToPublicPath,
              operation.outputPath
            ),
            args: operation.args,
          }
        }),
        args.pluginOptions
      )
    ),
  1
)

/**
 * @param {{inputPaths: string[], outputDir: string, args: WorkerInput}} args
 * @return Promise
 */
exports.IMAGE_PROCESSING = ({
  inputPaths,
  relativeToPublicPath,
  outputDir,
  args,
}) =>
  new Promise((resolve, reject) => {
    q.push({ inputPaths, relativeToPublicPath, outputDir, args }, function (
      err
    ) {
      if (err) {
        return reject(err)
      }

      return resolve()
    })
  })
