const sharp = require(`sharp`)
const qs = require(`qs`)
const imageSize = require(`image-size`)
const _ = require(`lodash`)
const Promise = require(`bluebird`)
const fs = require(`fs`)
const ProgressBar = require(`progress`)
const imagemin = require(`imagemin`)
const imageminPngquant = require(`imagemin-pngquant`)
const async = require(`async`)

// Promisify the sharp prototype (methods) to promisify the alternative (for
// raw) callback-accepting toBuffer(...) method
Promise.promisifyAll(sharp.prototype, { multiArgs: true })

// Try to enable the use of SIMD instructions. Seems to provide a smallish
// speedup on resizing heavy loads (~10%). Sharp disables this feature by
// default as there's been problems with segfaulting in the past but we'll be
// adventurous and see what happens with it on.
sharp.simd(true)

const toProcess = []

const processJobs = (jobs, count) => {
  const bar = new ProgressBar(`Generating image thumbnails [:bar] :current/:total :elapsed secs :percent`, {
    total: count,
    width: 30,
  })
  async.eachOfLimit(jobs, 4, (fileJobs, file, cb) => {
    Promise.all(fileJobs.map((job) => job.finished)).then(() => cb())
    const pipeline = sharp(file).rotate().withoutEnlargement()
    _.each(fileJobs, (job) => {
      const args = job.args
      let clonedPipeline
      if (fileJobs.length > 1) {
        clonedPipeline = pipeline.clone()
      } else {
        clonedPipeline = pipeline
      }
      // Sharp only allows ints as height/width. Since height isn't always
      // set, check first before trying to round it.
      let roundedHeight = args.height
      if (roundedHeight) { roundedHeight = Math.round(roundedHeight) }
      clonedPipeline.resize(Math.round(args.width), roundedHeight)
      .png({
        compressionLevel: args.pngCompressionLevel,
        adaptiveFiltering: false,
        force: false,
      })
      .jpeg({
        quality: args.quality,
        progressive: args.jpegProgressive,
        force: false,
      })

      // grayscale
      if (args.grayscale) {
        clonedPipeline = clonedPipeline.grayscale()
      }

      // rotate
      if (args.rotate) {
        clonedPipeline = clonedPipeline.rotate(args.rotate)
      }

      if (job.file.extension.match(/^jp/)) {
        clonedPipeline
        .toFile(job.outputPath, (err, info) => {
          bar.tick()
          job.outsideResolve(info)
        })
        // Compress pngs
      } else if (job.file.extension === `png`) {
        clonedPipeline.toBuffer()
        .then((sharpBuffer) => {
          imagemin.buffer(sharpBuffer, {
            plugins: [
              imageminPngquant({
                quality: `${args.quality - 25}-${args.quality}`, // e.g. 40-65
              }),
            ],
          })
          .then((imageminBuffer) => {
            fs.writeFile(job.outputPath, imageminBuffer, () => {
              bar.tick()
              job.outsideResolve()
            })
          })
        })
      }
    })
  })
}

const debouncedProcess = _.debounce(() => {
  // Filter out jobs for images that have already been created.
  let filteredJobs = toProcess.filter((job) => !fs.existsSync(job.outputPath))
  const count = filteredJobs.length

  // Group jobs by inputPath so Sharp can reuse work.
  const groupedJobs = _.groupBy(filteredJobs, (job) => job.inputPath)

  // Delete old jobs
  toProcess.length = 0

  processJobs(groupedJobs, count)
}, 500)

function queueImageResizing ({ file, args = {} }) {
  const defaultArgs = {
    width: 400,
    quality: 50,
    jpegProgressive: true,
    pngCompressionLevel: 9,
    grayscale: false,
  }
  const options = _.defaults(args, defaultArgs)
  // Filter out false args, and args not for this extension and put width at
  // end (for the file path)
  const pairedArgs = _.toPairs(args)
  let filteredArgs
  filteredArgs = _.filter(pairedArgs, (arg) => arg[1])
  filteredArgs = _.filter(filteredArgs, (arg) => {
    if (file.extension.match(/^jp*/)) {
      return !_.includes(arg[0], `png`)
    } else if (file.extension.match(/^png/)) {
      return !arg[0].match(/^jp*/)
    }
    return true
  })
  const sortedArgs = _.sortBy(filteredArgs, (arg) => arg[0] === `width`)
  const imgSrc = `/${file.hash}-${qs.stringify(_.fromPairs(sortedArgs))}.${file.extension}`
  const filePath = `${process.cwd()}/public${imgSrc}`
  // Create function to call when the image is finished.
  let outsideResolve
  const finished = new Promise((resolve) => {
    outsideResolve = resolve
  })

  let width
  let height
  let aspectRatio
  // Calculate the eventual width/height of the image.
  const dimensions = imageSize(file.id)
  aspectRatio = dimensions.width / dimensions.height

  // We don't allow enlargement so if either the requested height or
  // width is larger, we just return things as they are.
  if (options.width > dimensions.width || options.height > dimensions.height) {
    width = dimensions.width
    height = dimensions.height

  // If the width/height are both set, we're cropping so just return
  // that.
  } else if (options.width && options.height) {
    width = options.width
    height = options.height
  } else {

    // Use the aspect ratio of the image to calculate the resulting
    // height.
    width = options.width
    height = options.width / aspectRatio
  }

  // Create job and process.
  const job = {
    file,
    args: options,
    finished,
    outsideResolve,
    inputPath: file.id,
    outputPath: filePath,
  }
  toProcess.push(job)
  debouncedProcess()

  return {
    src: imgSrc,
    absolutePath: filePath,
    width,
    height,
    aspectRatio,
    finished,
  }
}

async function base64 ({ file, args = {} }) {
  const defaultArgs = {
    width: 20,
    quality: 50,
    jpegProgressive: true,
    pngCompressionLevel: 9,
    grayscale: false,
  }
  const options = _.defaults(args, defaultArgs)
  let pipeline = sharp(file.id).rotate().withoutEnlargement()
  pipeline.resize(options.width, options.height)
  .png({
    compressionLevel: options.pngCompressionLevel,
    adaptiveFiltering: false,
    force: false,
  })
  .jpeg({
    quality: options.quality,
    progressive: options.jpegProgressive,
    force: false,
  })

  // grayscale
  if (options.grayscale) {
    pipeline = pipeline.grayscale()
  }

  // rotate
  if (options.rotate) {
    pipeline = pipeline.rotate(options.rotate)
  }

  const [buffer, info] = await pipeline.toBufferAsync()

  return {
    src: `data:image/${info.format};base64,${buffer.toString(`base64`)}`,
    width: info.width,
    height: info.height,
    aspectRatio: info.width / info.height,
  }
}

async function responsiveSizes ({ file, args = {} }) {
  const defaultArgs = {
    maxWidth: 800,
    quality: 50,
    jpegProgressive: true,
    pngCompressionLevel: 9,
    grayscale: false,
  }
  const options = _.defaults(args, defaultArgs)
  options.maxWidth = parseInt(options.maxWidth, 10)

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
  const dimensions = imageSize(file.id)
  const filteredSizes = sizes.filter((size) => size < dimensions.width)

  // Add the original image to ensure the largest image possible
  // is available for small images. Also so we can link to
  // the original image.
  filteredSizes.push(dimensions.width)

  // Sort sizes for prettiness.
  const sortedSizes = _.sortBy(filteredSizes)

  // Queue sizes for processing.
  const images = sortedSizes.map((size) => {
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
      args: arrrgs,
    })
  })

  // Get base64 version
  const base64Image = await base64({ file })

  // Construct src and srcSet strings.
  const fallbackSrc = _.minBy(images, (image) => Math.abs(options.maxWidth - image.width)).src
  const srcSet = images.map((image) => `${image.src} ${image.width}w`).join(`,\n`)

  return {
    base64: base64Image.src,
    aspectRatio: images[0].aspectRatio,
    src: fallbackSrc,
    srcSet,
  }
}

async function responsiveResolution ({ file, args = {} }) {
  const defaultArgs = {
    width: 400,
    quality: 50,
    jpegProgressive: true,
    pngCompressionLevel: 9,
    grayscale: false,
  }
  const options = _.defaults(args, defaultArgs)
  options.width = parseInt(options.width, 10)

  // Create sizes for different resolutions — we do 1x, 1.5x, 2x, and 3x.
  const sizes = []
  sizes.push(options.width)
  sizes.push(options.width * 1.5)
  sizes.push(options.width * 2)
  sizes.push(options.width * 3)
  const dimensions = imageSize(file.id)

  const filteredSizes = sizes.filter((size) => size < dimensions.width)

  // Sort sizes for prettiness.
  const sortedSizes = _.sortBy(filteredSizes)

  const images = sortedSizes.map((size) => {
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
    })
  })

  // Get base64 version
  const base64Image = await base64({ file })

  // Construct src and srcSet strings.
  const fallbackSrc = images[0].src
  const srcSet = images.map((image, i) => {
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
  }).join(`,`)

  return {
    base64: base64Image.src,
    aspectRatio: images[0].aspectRatio,
    width: images[0].width,
    height: images[0].height,
    src: fallbackSrc,
    srcSet,
  }
}

exports.queueImageResizing = queueImageResizing
exports.base64 = base64
exports.responsiveSizes = responsiveSizes
exports.responsiveResolution = responsiveResolution
