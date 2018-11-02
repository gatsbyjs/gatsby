const sharp = require(`sharp`)
const crypto = require(`crypto`)
const imageSize = require(`probe-image-size`)
const _ = require(`lodash`)
const Promise = require(`bluebird`)
const fs = require(`fs-extra`)
const ProgressBar = require(`progress`)
const imagemin = require(`imagemin`)
const imageminMozjpeg = require(`imagemin-mozjpeg`)
const imageminPngquant = require(`imagemin-pngquant`)
const imageminWebp = require(`imagemin-webp`)
const queue = require(`async/queue`)
const path = require(`path`)
const existsSync = require(`fs-exists-cached`).sync

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

const generalArgs = {
  quality: 50,
  jpegProgressive: true,
  pngCompressionLevel: 9,
  base64: false,
  grayscale: false,
  duotone: false,
  pathPrefix: ``,
  toFormat: ``,
  sizeByPixelDensity: false,
}

const healOptions = (args, defaultArgs) => {
  let options = _.defaults({}, args, defaultArgs, generalArgs)
  options.quality = parseInt(options.quality, 10)
  options.pngCompressionLevel = parseInt(options.pngCompressionLevel, 10)
  options.toFormat = options.toFormat.toLowerCase()

  // only set width to 400 if neither width nor height is passed
  if (options.width === undefined && options.height === undefined) {
    options.width = 400
  } else if (options.width !== undefined) {
    options.width = parseInt(options.width, 10)
  } else if (options.height !== undefined) {
    options.height = parseInt(options.height, 10)
  }

  // only set maxWidth to 800 if neither maxWidth nor maxHeight is passed
  if (options.maxWidth === undefined && options.maxHeight === undefined) {
    options.maxWidth = 800
  } else if (options.maxWidth !== undefined) {
    options.maxWidth = parseInt(options.maxWidth, 10)
  } else if (options.maxHeight !== undefined) {
    options.maxHeight = parseInt(options.maxHeight, 10)
  }

  return options
}

const useMozjpeg = process.env.GATSBY_JPEG_ENCODER === `MOZJPEG`

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
    // Sharp only allows ints as height/width. Since both aren't always
    // set, check first before trying to round them.
    let roundedHeight = args.height
    if (roundedHeight) {
      roundedHeight = Math.round(roundedHeight)
    }

    let roundedWidth = args.width
    if (roundedWidth) {
      roundedWidth = Math.round(roundedWidth)
    }

    clonedPipeline
      .resize(roundedWidth, roundedHeight, {
        position: args.cropFocus,
      })
      .png({
        compressionLevel: args.pngCompressionLevel,
        adaptiveFiltering: false,
        force: args.toFormat === `png`,
      })
      .webp({
        quality: args.quality,
        force: args.toFormat === `webp`,
      })
      .tiff({
        quality: args.quality,
        force: args.toFormat === `tiff`,
      })

    // jpeg
    if (!useMozjpeg) {
      clonedPipeline = clonedPipeline.jpeg({
        quality: args.quality,
        progressive: args.jpegProgressive,
        force: args.toFormat === `jpg`,
      })
    }

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
        args.toFormat || job.file.extension,
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
      // Compress jpeg
    } else if (
      useMozjpeg &&
      ((job.file.extension === `jpg` && args.toFormat === ``) ||
        (job.file.extension === `jpeg` && args.toFormat === ``) ||
        args.toFormat === `jpg`)
    ) {
      clonedPipeline
        .toBuffer()
        .then(sharpBuffer =>
          imagemin
            .buffer(sharpBuffer, {
              plugins: [
                imageminMozjpeg({
                  quality: args.quality,
                  progressive: args.jpegProgressive,
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
      // any other format (tiff) - don't compress it just handle output
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
  if (existsSync(job.outputPath)) {
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
  const options = healOptions(args, {})
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

  const imgSrc = `/${file.name}.${fileExtension}`
  const dirPath = path.join(
    process.cwd(),
    `public`,
    `static`,
    file.internal.contentDigest,
    argsDigestShort
  )
  const filePath = path.join(dirPath, imgSrc)
  fs.ensureDirSync(dirPath)

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
  } else if (options.width) {
    // Use the aspect ratio of the image to calculate what will be the resulting
    // height.
    width = options.width
    height = Math.round(options.width / aspectRatio)
  } else {
    // Use the aspect ratio of the image to calculate what will be the resulting
    // width.
    height = options.height
    width = Math.round(options.height * aspectRatio)
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
  const digestDirPrefix = `${file.internal.contentDigest}/${argsDigestShort}`
  const prefixedSrc = options.pathPrefix + `/static/${digestDirPrefix}` + imgSrc

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
  const options = healOptions(args, { width: 20 })
  let pipeline
  try {
    pipeline = sharp(file.absolutePath).rotate()
  } catch (err) {
    reportError(`Failed to process image ${file.absolutePath}`, err, reporter)
    return null
  }

  pipeline
    .resize(options.width, options.height, {
      position: options.cropFocus,
    })
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
    pipeline = await duotone(
      options.duotone,
      args.toFormat || file.extension,
      pipeline
    )
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

async function fluid({ file, args = {}, reporter }) {
  const options = healOptions(args, {})

  // Account for images with a high pixel density. We assume that these types of
  // images are intended to be displayed at their native resolution.
  let metadata
  try {
    metadata = await sharp(file.absolutePath).metadata()
  } catch (err) {
    reportError(`Failed to process image ${file.absolutePath}`, err, reporter)
    return null
  }

  const { width, height, density, format } = metadata
  const pixelRatio =
    options.sizeByPixelDensity && typeof density === `number` && density > 0
      ? density / 72
      : 1

  // if no maxWidth is passed, we need to resize the image based on the passed maxHeight
  const fixedDimension =
    options.maxWidth === undefined ? `maxHeight` : `maxWidth`

  if (options[fixedDimension] < 1) {
    throw new Error(
      `${fixedDimension} has to be a positive int larger than zero (> 0), now it's ${
        options[fixedDimension]
      }`
    )
  }

  let presentationWidth, presentationHeight
  if (fixedDimension === `maxWidth`) {
    presentationWidth = Math.min(
      options.maxWidth,
      Math.round(width / pixelRatio)
    )
    presentationHeight = Math.round(presentationWidth * (height / width))
  } else {
    presentationHeight = Math.min(
      options.maxHeight,
      Math.round(height / pixelRatio)
    )
    presentationWidth = Math.round(presentationHeight * (width / height))
  }

  // If the users didn't set default sizes, we'll make one.
  if (!options.sizes) {
    options.sizes = `(max-width: ${presentationWidth}px) 100vw, ${presentationWidth}px`
  }

  // Create sizes (in width) for the image if no custom breakpoints are
  // provided. If the max width of the container for the rendered markdown file
  // is 800px, the sizes would then be: 200, 400, 800, 1200, 1600, 2400.
  //
  // This is enough sizes to provide close to the optimal image size for every
  // device size / screen resolution while (hopefully) not requiring too much
  // image processing time (Sharp has optimizations thankfully for creating
  // multiple sizes of the same input file)
  const fluidSizes = [
    options[fixedDimension], // ensure maxWidth (or maxHeight) is added
  ]
  // use standard breakpoints if no custom breakpoints are specified
  if (!options.srcSetBreakpoints || !options.srcSetBreakpoints.length) {
    fluidSizes.push(options[fixedDimension] / 4)
    fluidSizes.push(options[fixedDimension] / 2)
    fluidSizes.push(options[fixedDimension] * 1.5)
    fluidSizes.push(options[fixedDimension] * 2)
    fluidSizes.push(options[fixedDimension] * 3)
  } else {
    options.srcSetBreakpoints.forEach(breakpoint => {
      if (breakpoint < 1) {
        throw new Error(
          `All ints in srcSetBreakpoints should be positive ints larger than zero (> 0), found ${breakpoint}`
        )
      }
      // ensure no duplicates are added
      if (fluidSizes.includes(breakpoint)) {
        return
      }
      fluidSizes.push(breakpoint)
    })
  }
  const filteredSizes = fluidSizes.filter(
    size => size < (fixedDimension === `maxWidth` ? width : height)
  )

  // Add the original image to ensure the largest image possible
  // is available for small images. Also so we can link to
  // the original image.
  filteredSizes.push(fixedDimension === `maxWidth` ? width : height)

  // Sort sizes for prettiness.
  const sortedSizes = _.sortBy(filteredSizes)

  // Queue sizes for processing.
  const dimensionAttr = fixedDimension === `maxWidth` ? `width` : `height`
  const otherDimensionAttr = fixedDimension === `maxWidth` ? `height` : `width`
  const images = sortedSizes.map(size => {
    const arrrgs = {
      ...options,
      [otherDimensionAttr]: undefined,
      [dimensionAttr]: Math.round(size),
    }
    // Queue sizes for processing.
    if (options.maxWidth !== undefined && options.maxHeight !== undefined) {
      arrrgs.height = Math.round(size * (options.maxHeight / options.maxWidth))
    }

    return queueImageResizing({
      file,
      args: arrrgs, // matey
      reporter,
    })
  })

  const base64Width = 20
  const base64Height = Math.max(1, Math.round((base64Width * height) / width))
  const base64Args = {
    duotone: options.duotone,
    grayscale: options.grayscale,
    rotate: options.rotate,
    toFormat: options.toFormat,
    width: base64Width,
    height: base64Height,
  }

  // Get base64 version
  const base64Image = await base64({ file, args: base64Args, reporter })

  // Construct src and srcSet strings.
  const originalImg = _.maxBy(images, image => image.width).src
  const fallbackSrc = _.minBy(images, image =>
    Math.abs(options[fixedDimension] - image[dimensionAttr])
  ).src
  const srcSet = images
    .map(image => `${image.src} ${Math.round(image.width)}w`)
    .join(`,\n`)
  const originalName = file.base

  // figure out the srcSet format
  let srcSetType = `image/${format}`

  if (options.toFormat) {
    switch (options.toFormat) {
      case `png`:
        srcSetType = `image/png`
        break
      case `jpg`:
        srcSetType = `image/jpeg`
        break
      case `webp`:
        srcSetType = `image/webp`
        break
      case ``:
      case `no_change`:
      default:
        break
    }
  }

  return {
    base64: base64Image.src,
    aspectRatio: images[0].aspectRatio,
    src: fallbackSrc,
    srcSet,
    srcSetType,
    sizes: options.sizes,
    originalImg: originalImg,
    originalName: originalName,
    density,
    presentationWidth,
    presentationHeight,
  }
}

async function fixed({ file, args = {}, reporter }) {
  const options = healOptions(args, {})

  // if no width is passed, we need to resize the image based on the passed height
  const fixedDimension = options.width === undefined ? `height` : `width`

  // Create sizes for different resolutions — we do 1x, 1.5x, 2x, and 3x.
  const sizes = []
  sizes.push(options[fixedDimension])
  sizes.push(options[fixedDimension] * 1.5)
  sizes.push(options[fixedDimension] * 2)
  sizes.push(options[fixedDimension] * 3)
  const dimensions = getImageSize(file)

  const filteredSizes = sizes.filter(size => size <= dimensions[fixedDimension])

  // If there's no fluid images after filtering (e.g. image is smaller than what's
  // requested, add back the original so there's at least something)
  if (filteredSizes.length === 0) {
    filteredSizes.push(dimensions[fixedDimension])
    console.warn(
      `
                 The requested ${fixedDimension} "${
        options[fixedDimension]
      }px" for a resolutions field for
                 the file ${file.absolutePath}
                 was larger than the actual image ${fixedDimension} of ${
        dimensions[fixedDimension]
      }px!
                 If possible, replace the current image with a larger one.
                 `
    )
  }

  // Sort images for prettiness.
  const sortedSizes = _.sortBy(filteredSizes)

  const images = sortedSizes.map(size => {
    const arrrgs = {
      ...options,
      [fixedDimension]: Math.round(size),
    }
    // Queue images for processing.
    if (options.width !== undefined && options.height !== undefined) {
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
    toFormat: options.toFormat,
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
  const svgToMiniDataURI = require(`mini-svg-data-uri`)
  const trace = Promise.promisify(potrace.trace)
  const defaultArgs = {
    color: `lightgray`,
    optTolerance: 0.4,
    turdSize: 100,
    turnPolicy: potrace.Potrace.TURNPOLICY_MAJORITY,
  }
  const optionsSVG = _.defaults(args, defaultArgs)
  const options = healOptions(fileArgs, {})
  let pipeline
  try {
    pipeline = sharp(file.absolutePath).rotate()
  } catch (err) {
    reportError(`Failed to process image ${file.absolutePath}`, err, reporter)
    return null
  }

  pipeline
    .resize(options.width, options.height, {
      position: options.cropFocus,
    })
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
    pipeline = await duotone(
      options.duotone,
      args.toFormat || file.extension,
      pipeline
    )
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
    .then(svg => svgToMiniDataURI(svg))
}

const memoizedTraceSVG = _.memoize(
  notMemoizedtraceSVG,
  ({ file, args }) => `${file.absolutePath}${JSON.stringify(args)}`
)

async function traceSVG(args) {
  return await memoizedTraceSVG(args)
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
exports.resize = queueImageResizing
exports.base64 = base64
exports.traceSVG = traceSVG
exports.sizes = fluid
exports.resolutions = fixed
exports.fluid = fluid
exports.fixed = fixed
exports.getImageSize = getImageSize
