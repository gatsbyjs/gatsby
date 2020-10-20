import reporter from "gatsby-cli/lib/reporter"

const ProgressBar = require(`progress`)

// TODO remove in V3
export function createGatsbyProgressOrFallbackToExternalProgressBar(
  message,
  reporter
) {
  if (reporter && reporter.createProgress) {
    return reporter.createProgress(message)
  }

  const bar = new ProgressBar(
    ` [:bar] :current/:total :elapsed s :percent ${message}`,
    {
      total: 0,
      width: 30,
      clear: true,
    }
  )

  return {
    start() {},
    tick(increment = 1) {
      bar.tick(increment)
    },
    done() {},
    set total(value) {
      bar.total = value
    },
  }
}

let progressBar
let pendingImagesCounter = 0
let firstPass = true
export const createOrGetProgressBar = reporter => {
  if (!progressBar) {
    progressBar = createGatsbyProgressOrFallbackToExternalProgressBar(
      `Generating image thumbnails`,
      reporter
    )

    const originalDoneFn = progressBar.done

    // TODO this logic should be moved to the reporter.
    // when done is called we remove the progressbar instance and reset all the things
    // this will be called onPostBuild or when devserver is created
    progressBar.done = () => {
      originalDoneFn.call(progressBar)
      progressBar = null
      pendingImagesCounter = 0
    }

    progressBar.addImageToProcess = imageCount => {
      if (pendingImagesCounter === 0) {
        progressBar.start()
      }
      pendingImagesCounter += imageCount
      progressBar.total = pendingImagesCounter
    }

    // when we create a progressBar for the second time so when .done() has been called before
    // we create a modified tick function that automatically stops the progressbar when total is reached
    // this is used for development as we're watching for changes
    if (!firstPass) {
      let progressBarCurrentValue = 0
      const originalTickFn = progressBar.tick
      progressBar.tick = (ticks = 1) => {
        originalTickFn.call(progressBar, ticks)
        progressBarCurrentValue += ticks

        if (progressBarCurrentValue === pendingImagesCounter) {
          progressBar.done()
        }
      }
    }
    firstPass = false
  }

  return progressBar
}

export const getProgressBar = () => progressBar

export function rgbToHex(red, green, blue) {
  return `#${(blue | (green << 8) | (red << 16) | (1 << 24))
    .toString(16)
    .slice(1)}`
}

const warnForIgnoredParameters = (layout, parameters, filepath) => {
  const ignoredParams = Object.entries(parameters).filter(([_, value]) =>
    Boolean(value)
  )
  if (ignoredParams.length) {
    reporter(
      `The following provided parameter(s): ${ignoredParams
        .map(param => param.join(`: `))
        .join(
          `, `
        )} for the image at ${filepath} are ignored in ${layout} image layouts.`
    )
  }
  return
}

const DEFAULT_PIXEL_DENSITIES = [0.25, 0.5, 1, 2]
const DEFAULT_FLUID_SIZE = 800

const dedupeAndSortDensities = values =>
  Array.from(new Set([1, ...values])).sort()

export function calculateImageSizes(args) {
  const { width, maxWidth, height, maxHeight, file, layout } = args

  // check that all dimensions provided are positive
  const userDimensions = { width, maxWidth, height, maxHeight }
  const erroneousUserDimensions = Object.entries(userDimensions).filter(
    ([_, size]) => typeof size === `number` && size < 1
  )
  if (erroneousUserDimensions.length) {
    throw new Error(
      `Specified dimensions for images must be positive numbers (> 0). Problem dimensions you have are ${erroneousUserDimensions
        .map(dim => dim.join(`: `))
        .join(`, `)}`
    )
  }

  if (layout === `fixed`) {
    return fixedImageSizes(args)
  } else if (layout === `fluid` || layout === `constrained`) {
    return fluidImageSizes(args)
  } else {
    reporter.warn(
      `No valid layout was provided for the image at ${file.absolutePath}. Valid image layouts are fixed, fluid, and constrained.`
    )
    return []
  }
}
export function fixedImageSizes({
  file,
  imgDimensions,
  width,
  maxWidth,
  height,
  maxHeight,
  outputPixelDensities = DEFAULT_PIXEL_DENSITIES,
  srcSetBreakpoints,
}) {
  let sizes
  const aspectRatio = imgDimensions.width / imgDimensions.height
  // Sort, dedupe and ensure there's a 1
  const densities = dedupeAndSortDensities(outputPixelDensities)

  warnForIgnoredParameters(`fixed`, { maxWidth, maxHeight }, file.absolutePath)

  // if no width is passed, we need to resize the image based on the passed height
  if (!width) {
    width = height * aspectRatio
  }

  sizes = densities
    .filter(size => size >= 1) // remove smaller densities because fixed images don't need them
    .map(density => density * width)
    .filter(size => size <= imgDimensions.width)

  // If there's no fixed images after filtering (e.g. image is smaller than what's
  // requested, add back the original so there's at least something)
  if (sizes.length === 0) {
    sizes.push(width)
    const fixedDimension = width === undefined ? `height` : `width`
    reporter(`
                     The requested ${fixedDimension} "${
      fixedDimension === `width` ? width : height
    }px" for a resolutions field for
                     the file ${file.absolutePath}
                     was larger than the actual image ${fixedDimension} of ${
      imgDimensions[fixedDimension]
    }px!
                     If possible, replace the current image with a larger one.
                     `)
  }
  return sizes
}

export function fluidImageSizes({
  file,
  imgDimensions,
  width,
  maxWidth,
  height,
  maxHeight,
  outputPixelDensities = DEFAULT_PIXEL_DENSITIES,
  srcSetBreakpoints,
}) {
  // warn if ignored parameters are passed in
  warnForIgnoredParameters(
    `fluid and constrained`,
    { width, height },
    file.absolutePath
  )
  let sizes
  const aspectRatio = imgDimensions.width / imgDimensions.height
  // Sort, dedupe and ensure there's a 1
  const densities = dedupeAndSortDensities(outputPixelDensities)

  // Case 1: maxWidth of maxHeight were passed in, make sure it isn't larger than the actual image
  maxWidth = maxWidth && Math.min(maxWidth, imgDimensions.width)
  maxHeight = maxHeight && Math.min(maxHeight, imgDimensions.height)

  // Case 2: neither maxWidth or maxHeight were passed in, use default size
  if (!maxWidth && !maxHeight) {
    maxWidth = Math.min(DEFAULT_FLUID_SIZE, imgDimensions.width)
    maxHeight = maxWidth / aspectRatio
  }

  // if it still hasn't been found, calculate maxWidth from the derived maxHeight
  if (!maxWidth) {
    maxWidth = maxHeight * aspectRatio
  }

  // Create sizes (in width) for the image if no custom breakpoints are
  // provided. If the max width of the container for the rendered markdown file
  // is 800px, the sizes would then be: 200, 400, 800, 1600 if using
  // the default outputPixelDensities
  //
  // This is enough sizes to provide close to the optimal image size for every
  // device size / screen resolution while (hopefully) not requiring too much
  // image processing time (Sharp has optimizations thankfully for creating
  // multiple sizes of the same input file)
  if (srcSetBreakpoints) {
    sizes = srcSetBreakpoints.filter(size => size <= imgDimensions.width)
    if (outputPixelDensities) {
      reporter(
        `outputPixelDensities of ${outputPixelDensities} were passed into the image at ${file.absolutePath} with srcSetBreakpoints, srcSetBreakpoints will override the effect of outputPixelDensities`
      )
    }
  } else {
    sizes = densities.map(density => density * maxWidth)
    sizes = sizes.filter(size => size <= imgDimensions.width)
  }

  // ensure that the size passed in is included in the final output
  if (!sizes.includes(maxWidth)) {
    sizes.push(maxWidth)
  }
  sizes = sizes.sort((a, b) => a - b)
  return sizes
}
