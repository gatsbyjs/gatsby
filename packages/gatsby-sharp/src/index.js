const sharp = require(`sharp`)
const qs = require(`qs`)
const imageSize = require(`image-size`)
const _ = require(`lodash`)
const Promise = require(`bluebird`)
const fs = require(`fs`)

const toProcess = []

const processJobs = (jobs, count) => {
  console.time(`processing images`)
  Promise.all(_.values(jobs).map((job) => job.outsideResolve))
  .then(() => console.timeEnd(`processing images`))
  console.log("")
  console.log(`processing ${count} jobs!`)
  console.log(jobs)
  console.log("")
  _.each(jobs, (fileJobs, file) => {
    const pipeline = sharp(file).rotate().withoutEnlargement()
    _.each(fileJobs, (job) => {
      // Move job processing to own function so can call it
      // directly to get a base64 version of a file.
      const args = job.args
      let clonedPipeline
      if (fileJobs.length > 1) {
        clonedPipeline = pipeline.clone()
      } else {
        clonedPipeline = pipeline
      }
      clonedPipeline.resize(args.width, args.height)
      // TODO compress pngs with imagemin-pngquant as libvps doesn't do
      // lossy compression for pngs.
      //
      // TODO create gatsby-typegen-remark-resize-images which
      // goes through each image and creates images at
      // 2000, 1500, 1000, 500 and changes image to use srcset (in ast)
      // with explicit height/width. Make a sharp utils module
      // which has the processing queue + immediate mode (for base64)
      // so that anyone who wants to use image resizing can.
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
        clonedPipeline
        .toFile(job.outputPath)
        .then(() => job.outsideResolve())
      }
    })
  })
}

const debouncedProcess = _.debounce(() => {
  // Filter out jobs for images that have already been created.
  const filteredJobs = toProcess.filter((job) => !fs.existsSync(job.outputPath))
  const count = filteredJobs.length

  // Group jobs by inputPath so Sharp can reuse work.
  const groupedJobs = _.groupBy(filteredJobs, (job) => job.inputPath)

  // Delete old jobs
  toProcess.length = 0

  processJobs(groupedJobs, count)
}, 250)

module.exports = ({ file, args }, cb) => {
  const imgSrc = `/${file.hash}-${qs.stringify(args)}.${file.extension}`
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
  imageSize(file.id, (err, dimensions) => {
    aspectRatio = dimensions.width / dimensions.height

    // We don't allow enlargement so if either the requested height or
    // width is larger, we just return things as they are.
    if (args.width > dimensions.width || args.height > dimensions.height) {
      width = dimensions.width
      height = dimensions.height

    // If the width/height are both set, we're cropping so just return
    // that.
    } else if (args.width && args.height) {
      width = args.width
      height = args.height
    } else {

      // Use the aspect ratio of the image to calculate the resulting
      // height.
      width = args.width
      height = args.width / aspectRatio
    }

    // Create job and process.
    const job = {
      file,
      args,
      outsideResolve,
      inputPath: file.id,
      outputPath: filePath,
    }
    toProcess.push(job)
    debouncedProcess()

    return cb({
      src: imgSrc,
      absolutePath: filePath,
      width,
      height,
      aspectRatio,
      finished,
    })
  })
}
