const sharp = require(`sharp`)
const crypto = require(`crypto`)
const imageSize = require(`probe-image-size`)
const _ = require(`lodash`)
const Promise = require(`bluebird`)
const fs = require(`fs`)
const ProgressBar = require(`progress`)
const imagemin = require(`imagemin`)
const imageminPngquant = require(`imagemin-pngquant`)
const imageminWebp = require(`imagemin-webp`)
const queue = require(`async/queue`)
const path = require(`path`)

const imageSizeCache = new Map()
const getImageSize = file => {
  if (
    process.env.NODE_ENV !== `test` &&
    imageSizeCache.has(file.internal.contentDigest)
  ) {
    return imageSizeCache.get(file.internal.contentDigest)
  } else {
    const dimensions = imageSize.sync(
      toArray(fs.readFileSync(file.absolutePath))
    )
    imageSizeCache.set(file.internal.contentDigest, dimensions)
    return dimensions
  }
}

const duotone = require(`./duotone`)
const { boundActionCreators } = require(`gatsby/dist/redux/actions`)

// Promisify the sharp prototype (methods) to promisify the alternative (for
// raw) callback-accepting toBuffer(...) method
Promise.promisifyAll(sharp.prototype, { multiArgs: true })

// Try to enable the use of SIMD instructions. Seems to provide a smallish
// speedup on resizing heavy loads (~10%). Sharp disables this feature by
// default as there's been problems with segfaulting in the past but we'll be
// adventurous and see what happens with it on.
sharp.simd(true)

const bar = new ProgressBar(
  `Generating image thumbnails [:bar] :current/:total :elapsed secs :percent`,
  {
    total: 0,
    width: 30,
  }
)

const reportError = (message, err, reporter) => {
  if (reporter) {
    reporter.error(message, err)
  } else {
    console.error(message, err)
  }

  if (process.env.gatsby_executing_command === `build`) {
    process.exit(1)
  }
}

let totalJobs = 0
const processFile = (file, jobs, cb, reporter) => {
  // console.log("totalJobs", totalJobs)
  bar.total = totalJobs

  let imagesFinished = 0

  // Wait for each job promise to resolve.
  Promise.all(jobs.map(job => job.finishedPromise)).then(() => cb())

  let pipeline
  try {
    pipeline = sharp(file).rotate()
  } catch (err) {
    reportError(`Failed to process image ${file}`, err, reporter)
    jobs.forEach(job => job.outsideReject(err))
    return
  }

  jobs.forEach(async job => {
    const args = job.args
    let clonedPipeline
    if (jobs.length > 1) {
      clonedPipeline = pipeline.clone()
    } else {
      clonedPipeline = pipeline
    }
    // Sharp only allows ints as height/width. Since height isn't always
    // set, check first before trying to round it.
    let roundedHeight = args.height
    if (roundedHeight) {
      roundedHeight = Math.round(roundedHeight)
    }
    const roundedWidth = Math.round(args.width)
    clonedPipeline
      .resize(roundedWidth, roundedHeight)
      .crop(args.cropFocus)
      .png({
        compressionLevel: args.pngCompressionLevel,
        adaptiveFiltering: false,
        force: args.toFormat === `png`,
      })
      .jpeg({
        quality: args.quality,
        progressive: args.jpegProgressive,
        force: args.toFormat === `jpg`,
      })
      .webp({
        quality: args.quality,
        force: args.toFormat === `webp`,
      })
      .tiff({
        quality: args.quality,
        force: args.toFormat === `tiff`,
      })

    // grayscale
    if (args.grayscale) {
      clonedPipeline = clonedPipeline.grayscale()
    }

    // rotate
    if (args.rotate && args.rotate !== 0) {
      clonedPipeline = clonedPipeline.rotate(args.rotate)
    }

    // duotone
    if (args.duotone) {
      clonedPipeline = await duotone(
        args.duotone,
        job.file.extension,
        clonedPipeline
      )
    }

    const onFinish = err => {
      imagesFinished += 1
      bar.tick()
      boundActionCreators.setJob(
        {
          id: `processing image ${job.file.absolutePath}`,
          imagesFinished,
        },
        { name: `gatsby-plugin-sharp` }
      )

      if (err) {
        reportError(`Failed to process image ${file}`, err, reporter)
        job.outsideReject(err)
      } else {
        job.outsideResolve()
      }
    }

    if (
      (job.file.extension === `png` && args.toFormat === ``) ||
      args.toFormat === `png`
    ) {
      clonedPipeline
        .toBuffer()
        .then(sharpBuffer =>
          imagemin
            .buffer(sharpBuffer, {
              plugins: [
                imageminPngquant({
                  quality: `${args.quality}-${Math.min(
                    args.quality + 25,
                    100
                  )}`, // e.g. 40-65
                }),
              ],
            })
            .then(imageminBuffer => {
              fs.writeFile(job.outputPath, imageminBuffer, onFinish)
            })
            .catch(onFinish)
        )
        .catch(onFinish)
      // Compress webp
    } else if (
      (job.file.extension === `webp` && args.toFormat === ``) ||
      args.toFormat === `webp`
    ) {
      clonedPipeline
        .toBuffer()
        .then(sharpBuffer =>
          imagemin
            .buffer(sharpBuffer, {
              plugins: [imageminWebp({ quality: args.quality })],
            })
            .then(imageminBuffer => {
              fs.writeFile(job.outputPath, imageminBuffer, onFinish)
            })
            .catch(onFinish)
        )
        .catch(onFinish)
      // any other format (jpeg, tiff) - don't compress it just handle output
    } else {
      clonedPipeline.toFile(job.outputPath, onFinish)
    }
  })
}

const toProcess = {}
const q = queue((task, callback) => {
  task(callback)
}, 1)

const queueJob = (job, reporter) => {
  const inputFileKey = job.file.absolutePath.replace(/\./g, `%2E`)
  const outputFileKey = job.outputPath.replace(/\./g, `%2E`)
  const jobPath = `${inputFileKey}.${outputFileKey}`

  // Check if the job has already been queued. If it has, there's nothing
  // to do, return.
  if (_.has(toProcess, jobPath)) {
    return
  }

  // Check if the output file already exists so we don't redo work.
  if (fs.existsSync(job.outputPath)) {
    return
  }

  let notQueued = true
  if (toProcess[inputFileKey]) {
    notQueued = false
  }
  _.set(toProcess, jobPath, job)

  totalJobs += 1

  if (notQueued) {
    q.push(cb => {
      const jobs = _.values(toProcess[inputFileKey])
      // Delete the input key from the toProcess list so more jobs can be queued.
      delete toProcess[inputFileKey]
      boundActionCreators.createJob(
        {
          id: `processing image ${job.file.absolutePath}`,
          imagesCount: _.values(toProcess[inputFileKey]).length,
        },
        { name: `gatsby-plugin-sharp` }
      )
      // We're now processing the file's jobs.
      processFile(
        job.file.absolutePath,
        jobs,
        () => {
          boundActionCreators.endJob(
            {
              id: `processing image ${job.file.absolutePath}`,
            },
            { name: `gatsby-plugin-sharp` }
          )
          cb()
        },
        reporter
      )
    })
  }
}

function queueImageResizing({ file, args = {}, reporter }) {
  const defaultArgs = {
    width: 400,
    quality: 50,
    jpegProgressive: true,
    pngCompressionLevel: 9,
    grayscale: false,
    duotone: false,
    pathPrefix: ``,
    toFormat: ``,
  }
  const options = _.defaults(args, defaultArgs)
  // Filter out false args, and args not for this extension and put width at
  // end (for the file path)
  const pairedArgs = _.toPairs(args)
  let filteredArgs
  // Remove non-true arguments
  filteredArgs = _.filter(pairedArgs, arg => arg[1])
  // Remove pathPrefix
  filteredArgs = _.filter(filteredArgs, arg => arg[0] !== `pathPrefix`)
  filteredArgs = _.filter(filteredArgs, arg => {
    if (file.extension.match(/^jp*/)) {
      return !_.includes(arg[0], `png`)
    } else if (file.extension.match(/^png/)) {
      return !arg[0].match(/^jp*/)
    }
    return true
  })
  const sortedArgs = _.sortBy(filteredArgs, arg => arg[0] === `width`)
  const fileExtension = options.toFormat ? options.toFormat : file.extension

  const argsDigest = crypto
    .createHash(`md5`)
    .update(JSON.stringify(sortedArgs))
    .digest(`hex`)

  const argsDigestShort = argsDigest.substr(argsDigest.length - 5)

  const imgSrc = `/${file.name}-${
    file.internal.contentDigest
  }-${argsDigestShort}.${fileExtension}`
  const filePath = path.join(process.cwd(), `public`, `static`, imgSrc)

  // Create function to call when the image is finished.
  let outsideResolve, outsideReject
  const finishedPromise = new Promise((resolve, reject) => {
    outsideResolve = resolve
    outsideReject = reject
  })

  let width
  let height
  // Calculate the eventual width/height of the image.
  const dimensions = getImageSize(file)
  let aspectRatio = dimensions.width / dimensions.height
  const originalName = file.base

  // If the width/height are both set, we're cropping so just return
  // that.
  if (options.width && options.height) {
    width = options.width
    height = options.height
    // Recalculate the aspectRatio for the cropped photo
    aspectRatio = width / height
  } else {
    // Use the aspect ratio of the image to calculate what will be the resulting
    // height.
    width = options.width
    height = Math.round(options.width / aspectRatio)
  }

  // Create job and process.
  const job = {
    file,
    args: options,
    finishedPromise,
    outsideResolve,
    outsideReject,
    inputPath: file.absolutePath,
    outputPath: filePath,
  }

  queueJob(job, reporter)

  // Prefix the image src.
  const prefixedSrc = options.pathPrefix + `/static` + imgSrc

  return {
    src: prefixedSrc,
    absolutePath: filePath,
    width,
    height,
    aspectRatio,
    finishedPromise,
    originalName: originalName,
  }
}

async function notMemoizedbase64({ file, args = {}, reporter }) {
  const defaultArgs = {
    width: 20,
    quality: 50,
    jpegProgressive: true,
    pngCompressionLevel: 9,
    grayscale: false,
    duotone: false,
    toFormat: ``,
  }
  const options = _.defaults(args, defaultArgs)
  let pipeline
  try {
    pipeline = sharp(file.absolutePath).rotate()
  } catch (err) {
    reportError(`Failed to process image ${file.absolutePath}`, err, reporter)
    return null
  }

  pipeline
    .resize(options.width, options.height)
    .crop(options.cropFocus)
    .png({
      compressionLevel: options.pngCompressionLevel,
      adaptiveFiltering: false,
      force: args.toFormat === `png`,
    })
    .jpeg({
      quality: options.quality,
      progressive: options.jpegProgressive,
      force: args.toFormat === `jpg`,
    })

  // grayscale
  if (options.grayscale) {
    pipeline = pipeline.grayscale()
  }

  // rotate
  if (options.rotate && options.rotate !== 0) {
    pipeline = pipeline.rotate(options.rotate)
  }

  // duotone
  if (options.duotone) {
    pipeline = await duotone(options.duotone, file.extension, pipeline)
  }

  const [buffer, info] = await pipeline.toBufferAsync()
  const originalName = file.base

  return {
    src: `data:image/${info.format};base64,${buffer.toString(`base64`)}`,
    width: info.width,
    height: info.height,
    aspectRatio: info.width / info.height,
    originalName: originalName,
  }
}

const memoizedBase64 = _.memoize(
  notMemoizedbase64,
  ({ file, args }) => `${file.id}${JSON.stringify(args)}`
)

async function base64(args) {
  return await memoizedBase64(args)
}

async function responsiveSizes({ file, args = {}, reporter }) {
  const defaultArgs = {
    maxWidth: 800,
    quality: 50,
    jpegProgressive: true,
    pngCompressionLevel: 9,
    grayscale: false,
    duotone: false,
    pathPrefix: ``,
    toFormat: ``,
    sizeByPixelDensity: false,
  }
  const options = _.defaults({}, args, defaultArgs)
  options.maxWidth = parseInt(options.maxWidth, 10)

  // Account for images with a high pixel density. We assume that these types of
  // images are intended to be displayed at their native resolution.
  let metadata
  try {
    metadata = await sharp(file.absolutePath).metadata()
  } catch (err) {
    reportError(`Failed to process image ${file.absolutePath}`, err, reporter)
    return null
  }

  const { width, height, density } = metadata
  const pixelRatio =
    options.sizeByPixelDensity && typeof density === `number` && density > 0
      ? density / 72
      : 1
  const presentationWidth = Math.min(
    options.maxWidth,
    Math.round(width / pixelRatio)
  )
  const presentationHeight = Math.round(presentationWidth * (height / width))

  // If the users didn't set a default sizes, we'll make one.
  if (!options.sizes) {
    options.sizes = `(max-width: ${presentationWidth}px) 100vw, ${presentationWidth}px`
  }

  // Create sizes (in width) for the image. If the max width of the container
  // for the rendered markdown file is 800px, the sizes would then be: 200,
  // 400, 800, 1200, 1600, 2400.
  //
  // This is enough sizes to provide close to the optimal image size for every
  // device size / screen resolution while (hopefully) not requiring too much
  // image processing time (Sharp has optimizations thankfully for creating
  // multiple sizes of the same input file)
  const sizes = []
  sizes.push(options.maxWidth / 4)
  sizes.push(options.maxWidth / 2)
  sizes.push(options.maxWidth)
  sizes.push(options.maxWidth * 1.5)
  sizes.push(options.maxWidth * 2)
  sizes.push(options.maxWidth * 3)
  const filteredSizes = sizes.filter(size => size < width)

  // Add the original image to ensure the largest image possible
  // is available for small images. Also so we can link to
  // the original image.
  filteredSizes.push(width)

  // Sort sizes for prettiness.
  const sortedSizes = _.sortBy(filteredSizes)

  // Queue sizes for processing.
  const images = sortedSizes.map(size => {
    const arrrgs = {
      ...options,
      width: Math.round(size),
    }
    // Queue sizes for processing.
    if (options.maxHeight) {
      arrrgs.height = Math.round(size * (options.maxHeight / options.maxWidth))
    }

    return queueImageResizing({
      file,
      args: arrrgs, // matey
      reporter,
    })
  })

  const base64Width = 20
  const base64Height = Math.max(1, Math.round(base64Width * height / width))
  const base64Args = {
    duotone: options.duotone,
    grayscale: options.grayscale,
    rotate: options.rotate,
    width: base64Width,
    height: base64Height,
  }

  // Get base64 version
  const base64Image = await base64({ file, args: base64Args, reporter })

  // Construct src and srcSet strings.
  const originalImg = _.maxBy(images, image => image.width).src
  const fallbackSrc = _.minBy(images, image =>
    Math.abs(options.maxWidth - image.width)
  ).src
  const srcSet = images
    .map(image => `${image.src} ${Math.round(image.width)}w`)
    .join(`,\n`)
  const originalName = file.base

  return {
    base64: base64Image.src,
    aspectRatio: images[0].aspectRatio,
    src: fallbackSrc,
    srcSet,
    sizes: options.sizes,
    originalImg: originalImg,
    originalName: originalName,
    density,
    presentationWidth,
    presentationHeight,
  }
}

async function resolutions({ file, args = {}, reporter }) {
  const defaultArgs = {
    width: 400,
    quality: 50,
    jpegProgressive: true,
    pngCompressionLevel: 9,
    grayscale: false,
    duotone: false,
    pathPrefix: ``,
    toFormat: ``,
  }
  const options = _.defaults({}, args, defaultArgs)
  options.width = parseInt(options.width, 10)

  // Create sizes for different resolutions — we do 1x, 1.5x, 2x, and 3x.
  const sizes = []
  sizes.push(options.width)
  sizes.push(options.width * 1.5)
  sizes.push(options.width * 2)
  sizes.push(options.width * 3)
  const dimensions = getImageSize(file)

  const filteredSizes = sizes.filter(size => size <= dimensions.width)

  // If there's no sizes after filtering (e.g. image is smaller than what's
  // requested, add back the original so there's at least something)
  if (filteredSizes.length === 0) {
    filteredSizes.push(dimensions.width)
    console.warn(
      `
                 The requested width "${
                   options.width
                 }px" for a resolutions field for
                 the file ${file.absolutePath}
                 was wider than the actual image width of ${dimensions.width}px!
                 If possible, replace the current image with a larger one.
                 `
    )
  }

  // Sort sizes for prettiness.
  const sortedSizes = _.sortBy(filteredSizes)

  const images = sortedSizes.map(size => {
    const arrrgs = {
      ...options,
      width: Math.round(size),
    }
    // Queue sizes for processing.
    if (options.height) {
      arrrgs.height = Math.round(size * (options.height / options.width))
    }

    return queueImageResizing({
      file,
      args: arrrgs,
      reporter,
    })
  })

  const base64Args = {
    duotone: options.duotone,
    grayscale: options.grayscale,
    rotate: options.rotate,
  }

  // Get base64 version
  const base64Image = await base64({ file, args: base64Args, reporter })

  const fallbackSrc = images[0].src
  const srcSet = images
    .map((image, i) => {
      let resolution
      switch (i) {
        case 0:
          resolution = `1x`
          break
        case 1:
          resolution = `1.5x`
          break
        case 2:
          resolution = `2x`
          break
        case 3:
          resolution = `3x`
          break
        default:
      }
      return `${image.src} ${resolution}`
    })
    .join(`,\n`)

  const originalName = file.base

  return {
    base64: base64Image.src,
    aspectRatio: images[0].aspectRatio,
    width: images[0].width,
    height: images[0].height,
    src: fallbackSrc,
    srcSet,
    originalName: originalName,
  }
}

async function notMemoizedtraceSVG({ file, args, fileArgs, reporter }) {
  const potrace = require(`potrace`)
  const trace = Promise.promisify(potrace.trace)
  const defaultArgs = {
    color: `lightgray`,
    optTolerance: 0.4,
    turdSize: 100,
    turnPolicy: potrace.Potrace.TURNPOLICY_MAJORITY,
  }
  const optionsSVG = _.defaults(args, defaultArgs)

  const defaultFileResizeArgs = {
    width: 400,
    quality: 50,
    jpegProgressive: true,
    pngCompressionLevel: 9,
    grayscale: false,
    duotone: false,
    toFormat: ``,
  }
  const options = _.defaults(fileArgs, defaultFileResizeArgs)
  let pipeline
  try {
    pipeline = sharp(file.absolutePath).rotate()
  } catch (err) {
    reportError(`Failed to process image ${file.absolutePath}`, err, reporter)
    return null
  }

  pipeline
    .resize(options.width, options.height)
    .crop(options.cropFocus)
    .png({
      compressionLevel: options.pngCompressionLevel,
      adaptiveFiltering: false,
      force: args.toFormat === `png`,
    })
    .jpeg({
      quality: options.quality,
      progressive: options.jpegProgressive,
      force: args.toFormat === `jpg`,
    })

  // grayscale
  if (options.grayscale) {
    pipeline = pipeline.grayscale()
  }

  // rotate
  if (options.rotate && options.rotate !== 0) {
    pipeline = pipeline.rotate(options.rotate)
  }

  // duotone
  if (options.duotone) {
    pipeline = await duotone(options.duotone, file.extension, pipeline)
  }

  const tmpDir = require(`os`).tmpdir()
  const tmpFilePath = `${tmpDir}/${file.internal.contentDigest}-${
    file.name
  }-${crypto
    .createHash(`md5`)
    .update(JSON.stringify(fileArgs))
    .digest(`hex`)}.${file.extension}`

  await new Promise(resolve =>
    pipeline.toFile(tmpFilePath, (err, info) => {
      resolve()
    })
  )

  return trace(tmpFilePath, optionsSVG)
    .then(svg => optimize(svg))
    .then(svg => encodeOptimizedSVGDataUri(svg))
}

const memoizedTraceSVG = _.memoize(
  notMemoizedtraceSVG,
  ({ file, args }) => `${file.absolutePath}${JSON.stringify(args)}`
)

async function traceSVG(args) {
  return await memoizedTraceSVG(args)
}

// https://codepen.io/tigt/post/optimizing-svgs-in-data-uris
function encodeOptimizedSVGDataUri(svgString) {
  var uriPayload = encodeURIComponent(svgString) // encode URL-unsafe characters
    .replace(/%0A/g, ``) // remove newlines
    .replace(/%20/g, ` `) // put spaces back in
    .replace(/%3D/g, `=`) // ditto equals signs
    .replace(/%3A/g, `:`) // ditto colons
    .replace(/%2F/g, `/`) // ditto slashes
    .replace(/%22/g, `'`) // replace quotes with apostrophes (may break certain SVGs)

  return `data:image/svg+xml,` + uriPayload
}

const optimize = svg => {
  const SVGO = require(`svgo`)
  const svgo = new SVGO({ multipass: true, floatPrecision: 0 })
  return new Promise((resolve, reject) => {
    svgo.optimize(svg, ({ data }) => resolve(data))
  })
}

function toArray(buf) {
  var arr = new Array(buf.length)

  for (var i = 0; i < buf.length; i++) {
    arr[i] = buf[i]
  }

  return arr
}

exports.queueImageResizing = queueImageResizing
exports.base64 = base64
exports.traceSVG = traceSVG
exports.responsiveSizes = responsiveSizes
exports.responsiveResolution = resolutions
exports.sizes = responsiveSizes
exports.resolutions = resolutions
