const sharp = require(`sharp`)
const qs = require(`qs`)
const imageSize = require(`image-size`)
const _ = require(`lodash`)
const Promise = require(`bluebird`)
const fs = require(`fs`)
const ProgressBar = require(`progress`)
const imagemin = require('imagemin')
const imageminPngquant = require('imagemin-pngquant')

// Try to enable the use of SIMD instructions. Seems to provide a smallish
// speedup on resizing heavy loads (~10%). The feature is off by default as
// there's been problems with segfaulting in the past.
sharp.simd(true)

const toProcess = []

const processJobs = (jobs, count) => {
  const bar = new ProgressBar(`creating image thumbnails [:bar] :current/:total :elapsed secs :percent`, {
    total: count,
    width: 30,
  })
  console.log(``)
  _.each(jobs, (fileJobs, file) => {
    const pipeline = sharp(file).rotate().withoutEnlargement()
    _.each(fileJobs, (job) => {
      const args = job.args
      let clonedPipeline
      if (fileJobs.length > 1) {
        clonedPipeline = pipeline.clone()
      } else {
        clonedPipeline = pipeline
      }
      clonedPipeline.resize(args.width, args.height)
      .png({
        compressionLevel: args.pngCompressionLevel,
        adaptiveFiltering: false,
        force: false,
      })
      .jpeg({
        quality: args.jpegQuality,
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

      if (args.base64) {
        clonedPipeline.toBuffer((err, data) => {
          resolve({
            src: data.toString(`base64`),
            width: args.width,
          })
        })
      } else {
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
                  quality: '50-80',
                  verbose: true,
                }),
              ],
            })
            .then((imageminBuffer) => {
              fs.writeFile(job.outputPath, imageminBuffer, () => {
                console.log(`finished processing png`)
                bar.tick()
                job.outsideResolve()
              })
            })
          })
        }
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

exports.queueImageResizing = ({ file, args = {} }, cb) => {
  const defaultArgs = {
    width: 400,
    jpegQuality: 50,
    jpegProgressive: true,
    pngCompressionLevel: 9,
    grayscale: false,
  }
  const allArgs = _.defaults(args, defaultArgs)
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
  const dimensions = imageSize(file.id) //, (err, dimensions) => {
  aspectRatio = dimensions.width / dimensions.height

  // We don't allow enlargement so if either the requested height or
  // width is larger, we just return things as they are.
  if (allArgs.width > dimensions.width || allArgs.height > dimensions.height) {
    width = dimensions.width
    height = dimensions.height

  // If the width/height are both set, we're cropping so just return
  // that.
  } else if (allArgs.width && allArgs.height) {
    width = allArgs.width
    height = allArgs.height
  } else {

    // Use the aspect ratio of the image to calculate the resulting
    // height.
    width = allArgs.width
    height = allArgs.width / aspectRatio
  }

  // Create job and process.
  const job = {
    file,
    args: allArgs,
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

exports.base64 = ({ file, args = {} }, cb) => {
  const defaultArgs = {
    width: 40,
    jpegQuality: 50,
    jpegProgressive: true,
    pngCompressionLevel: 9,
    grayscale: false,
  }
  const allArgs = _.defaults(args, defaultArgs)
  let pipeline = sharp(file.id).rotate().withoutEnlargement()
  pipeline.resize(allArgs.width, allArgs.height)
  .png({
    compressionLevel: allArgs.pngCompressionLevel,
    adaptiveFiltering: false,
    force: false,
  })
  .jpeg({
    quality: allArgs.jpegQuality,
    progressive: allArgs.jpegProgressive,
    force: false,
  })

  // grayscale
  if (allArgs.grayscale) {
    pipeline = pipeline.grayscale()
  }

  // rotate
  if (allArgs.rotate) {
    pipeline = pipeline.rotate(allArgs.rotate)
  }

  pipeline.toBuffer((err, buffer, info) => {
    cb(err, {
      src: `data:image/${info.format};base64,${buffer.toString(`base64`)}`,
      width: info.width,
      height: info.height,
      aspectRatio: info.width / info.height,
    })
  })
}
