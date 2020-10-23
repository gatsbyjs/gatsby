const {
  setBoundActionCreators,
  // queue: jobQueue,
  // reportError,
} = require(`./index`)
const { getProgressBar, createOrGetProgressBar } = require(`./utils`)

const { setPluginOptions } = require(`./plugin-options`)

// create the progressbar once and it will be killed in another lifecycle
const finishProgressBar = () => {
  const progressBar = getProgressBar()
  if (progressBar) {
    progressBar.done()
  }
}

exports.onPostBuild = () => finishProgressBar()
exports.onCreateDevServer = () => finishProgressBar()

exports.onPreBootstrap = ({ actions, emitter, reporter }, pluginOptions) => {
  setBoundActionCreators(actions)
  setPluginOptions(pluginOptions)

  // below is a hack / hot fix for confusing progress bar behaviour
  // that doesn't recognize duplicate jobs, as it's now
  // in gatsby core internals (if `createJobV2` is available)
  // we should remove this or make this code path not hit
  // (we should never use emitter in plugins)
  // as soon as possible (possibly by moving progress bar handling
  // inside jobs-manager in core)

  if (emitter) {
    // track how many image transformation each job has
    // END_JOB_V2 doesn't contain that information
    // so we store it in <JobContentHash, TransformsCount> map
    // when job is created. Then retrieve that when job finishes
    // and remove that entry from the map.
    const imageCountInJobsMap = new Map()

    emitter.on(`CREATE_JOB_V2`, action => {
      if (action.plugin.name === `gatsby-plugin-sharp`) {
        const job = action.payload.job
        const imageCount = job.args.operations.length
        imageCountInJobsMap.set(job.contentDigest, imageCount)
        const progress = createOrGetProgressBar(reporter)
        progress.addImageToProcess(imageCount)
      }
    })

    emitter.on(`END_JOB_V2`, action => {
      if (action.plugin.name === `gatsby-plugin-sharp`) {
        const jobContentDigest = action.payload.jobContentDigest
        const imageCount = imageCountInJobsMap.get(jobContentDigest)
        const progress = createOrGetProgressBar(reporter)
        progress.tick(imageCount)
        imageCountInJobsMap.delete(jobContentDigest)
      }
    })
  }

  // normalizedOptions = setPluginOptions(pluginOptions)
}

if (process.env.GATSBY_EXPERIMENTAL_PLUGIN_OPTION_VALIDATION) {
  exports.pluginOptionsSchema = ({ Joi }) =>
    Joi.object({
      base64Width: Joi.number()
        .default(20)
        .description(`The width of the generated base64 preview image`),
      forceBase64Format: Joi.any()
        .valid(`png`, `jpg`, `webp`)
        .description(
          `Force a different format for the generated base64 image. Defaults to the same format as the input image`
        ),
      useMozJpeg: Joi.boolean().description(
        `The the mozJpeg library for encoding. Defaults to false, unless \`process.env.GATSBY_JPEG_ENCODER\` === \`MOZJPEG\``
      ),
      stripMetadata: Joi.boolean().default(true),
      defaultQuality: Joi.number().default(50),
      failOnError: Joi.boolean().default(true),
    })
}
