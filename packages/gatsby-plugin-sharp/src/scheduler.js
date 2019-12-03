const _ = require(`lodash`)
const uuidv4 = require(`uuid/v4`)
const got = require(`got`)
const { createContentDigest } = require(`gatsby-core-utils`)
const worker = require(`./worker`)

const scheduleJob = async (job, boundActionCreators) => {
  if (process.env.GATSBY_CLOUD_IMAGE_SERVICE_URL) {
    return got.post(process.env.GATSBY_CLOUD_IMAGE_SERVICE_URL, {
      body: {
        file: job.inputPaths[0],
        hash: createContentDigest(job),
        transforms: job.args.operations,
        options: job.args.pluginOptions,
      },
      json: true,
    })
  }

  const jobId = uuidv4()
  boundActionCreators.createJob(
    {
      id: jobId,
      description: `processing image ${job.inputPaths[0]}`,
      imagesCount: job.args.operations.length,
    },
    { name: `gatsby-plugin-sharp` }
  )

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      try {
        worker
          .IMAGE_PROCESSING({
            inputPaths: job.inputPaths.map(inputPath => {
              return {
                path: inputPath,
                contentDigest: createContentDigest(inputPath),
              }
            }),
            outputDir: job.outputDir,
            args: job.args,
          })
          .then(() => {
            boundActionCreators.endJob(
              { id: jobId },
              { name: `gatsby-plugin-sharp` }
            )
            resolve()
          })
          .catch(err => {
            boundActionCreators.endJob(
              { id: jobId },
              { name: `gatsby-plugin-sharp` }
            )
            reject(err)
          })
      } catch (err) {
        boundActionCreators.endJob(
          { id: jobId },
          { name: `gatsby-plugin-sharp` }
        )
        reject(err)
      }
    })
  })
}

export { scheduleJob }
