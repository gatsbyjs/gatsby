const {
  setActions,
  // queue: jobQueue,
  // reportError,
  _unstable_createJob,
  _lazyJobsEnabled,
} = require(`./index`)
const { pathExists } = require(`fs-extra`)
const { slash } = require(`gatsby-core-utils/path`)

const { setPluginOptions } = require(`./plugin-options`)
const path = require(`path`)

function removeCachedValue(cache, key) {
  if (cache?.del) {
    // if cache expose ".del" method directly on public interface
    return cache.del(key)
  } else if (cache?.cache?.del) {
    // legacy - using internal cache instance and calling ".del" on it directly
    return cache.cache.del(key)
  }
  return Promise.reject(
    new Error(`Cache instance doesn't expose ".del" function`)
  )
}

exports.onCreateDevServer = async ({ app, cache, reporter }) => {
  if (!_lazyJobsEnabled()) {
    return
  }

  app.use(async (req, res, next) => {
    const decodedURI = decodeURIComponent(req.path)
    const pathOnDisk = path.resolve(path.join(`./public/`, decodedURI))

    const jobContentDigest = await cache.get(decodedURI)
    const cacheResult = jobContentDigest
      ? await cache.get(jobContentDigest)
      : null

    if (!cacheResult) {
      // this handler is meant to handle lazy images only (images that were registered for
      // processing, but deffered to be processed only on request in develop server).
      // If we don't have cache result - it means that this is not lazy image or that
      // image was already handled in which case `express.static` handler (that is earlier
      // than this handler) should take care of handling request.
      return next()
    }

    // We are going to run a job for a single operation only
    // and postpone all other operations
    // This speeds up the loading of lazy images in the browser and
    // also helps to free up the browser connection queue earlier.
    const { matchingJob, jobWithRemainingOperations } =
      splitOperationsByRequestedFile(cacheResult, pathOnDisk)

    await _unstable_createJob(matchingJob, { reporter })
    await removeCachedValue(cache, decodedURI)

    if (jobWithRemainingOperations.args.operations.length > 0) {
      // There are still some operations pending for this job - replace the cached job
      await cache.set(jobContentDigest, jobWithRemainingOperations)
    } else {
      // No operations left to process - purge the cache
      await removeCachedValue(cache, jobContentDigest)
    }

    // we reach this point only when this is a lazy image that we just processed
    // because `express.static` is earlier handler, we do have to manually serve
    // produced file for current request
    return res.sendFile(pathOnDisk)
  })
}

// Split the job into two jobs:
//  - first job with a single operation matching requestedPathOnDisk
//  - second job with all other operations
// so the two resulting jobs are only different by their operations
function splitOperationsByRequestedFile(job, requestedPathOnDisk) {
  const matchingJob = {
    ...job,
    args: { ...job.args, operations: [] },
  }
  const jobWithRemainingOperations = {
    ...job,
    args: { ...job.args, operations: [] },
  }

  job.args.operations.forEach(op => {
    const operationPath = path.resolve(path.join(job.outputDir, op.outputPath))
    if (operationPath === requestedPathOnDisk) {
      matchingJob.args.operations.push(op)
    } else {
      jobWithRemainingOperations.args.operations.push(op)
    }
  })
  if (matchingJob.args.operations.length === 0) {
    throw new Error(
      `Could not find matching operation for ${requestedPathOnDisk}`
    )
  }
  return { matchingJob, jobWithRemainingOperations }
}

// So something is wrong with the reporter, when I do this in preBootstrap,
// the progressbar gets not updated
exports.onPostBootstrap = async ({ reporter, cache, store }) => {
  if (process.env.gatsby_executing_command !== `develop`) {
    // recreate jobs that haven't been triggered by develop yet
    // removing stale jobs has already kicked in so we know these still need to process
    for (const [contentDigest] of store.getState().jobsV2.complete) {
      const job = await cache.get(contentDigest)

      if (job) {
        // we don't have to await, gatsby does this for us
        _unstable_createJob(job, { reporter })
      }
    }
  }
}

// to properly initialize plugin in worker (`onPreBootstrap` won't run in workers)
exports.onPluginInit = async ({ actions }, pluginOptions) => {
  setActions(actions)
  setPluginOptions(pluginOptions)
}

exports.onPreBootstrap = async ({ actions, emitter, cache }, pluginOptions) => {
  setActions(actions)
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
        if (action.payload.job.args.isLazy) {
          // we have to remove some internal pieces
          const job = {
            name: action.payload.job.name,
            inputPaths: action.payload.job.inputPaths.map(input => input.path),
            outputDir: action.payload.job.outputDir,
            args: {
              ...action.payload.job.args,
              isLazy: false,
            },
          }
          cache.set(action.payload.job.contentDigest, job)

          action.payload.job.args.operations.forEach(op => {
            const cacheKey = slash(
              path.relative(
                path.join(process.cwd(), `public`),
                path.join(action.payload.job.outputDir, op.outputPath)
              )
            )

            cache.set(`/${cacheKey}`, action.payload.job.contentDigest)
          })

          return
        }

        const job = action.payload.job
        const imageCount = job.args.operations.length
        imageCountInJobsMap.set(job.contentDigest, imageCount)
      }
    })

    emitter.on(`END_JOB_V2`, action => {
      if (action.plugin.name === `gatsby-plugin-sharp`) {
        const jobContentDigest = action.payload.jobContentDigest

        // when it's lazy we didn't set it
        if (!imageCountInJobsMap.has(jobContentDigest)) {
          return
        }

        imageCountInJobsMap.delete(jobContentDigest)
      }
    })
  }

  // normalizedOptions = setPluginOptions(pluginOptions)
}

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
    // TODO(v6): Remove deprecated failOnError option
    failOnError: Joi.boolean().default(true),
    failOn: Joi.any()
      .valid(`none`, `truncated`, `error`, `warning`)
      .default(`warning`)
      .description(`Level of sensitivity to invalid images`),
    defaults: Joi.object({
      formats: Joi.array().items(
        Joi.string().valid(`auto`, `png`, `jpg`, `webp`, `avif`)
      ),
      placeholder: Joi.string().valid(
        `tracedSVG`,
        `dominantColor`,
        `blurred`,
        `none`
      ),
      quality: Joi.number(),
      breakpoints: Joi.array().items(Joi.number()),
      backgroundColor: Joi.string(),
      transformOptions: Joi.object(),
      tracedSVGOptions: Joi.object(),
      blurredOptions: Joi.object(),
      jpgOptions: Joi.object(),
      pngOptions: Joi.object(),
      webpOptions: Joi.object(),
      avifOptions: Joi.object(),
    }).description(
      `Default options used by gatsby-plugin-image. \nSee https://gatsbyjs.com/docs/reference/built-in-components/gatsby-plugin-image/`
    ),
  }).custom(value => {
    const shouldNotFailOnError = !value.failOnError

    if (shouldNotFailOnError) {
      // show this warning only once in main process
      if (!process.env.GATSBY_WORKER_ID) {
        console.warn(
          `[gatsby-plugin-sharp]: The "failOnError" option is deprecated. Please use "failOn" instead.`
        )
      }

      return {
        ...value,
        failOn: `none`,
      }
    }

    return {
      ...value,
    }
  })
