import ProgressBar from "progress"
import sharp from "./safe-sharp"
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

const DEFAULT_PIXEL_DENSITIES = [0.25, 0.5, 1, 2]
const DEFAULT_FLUID_SIZE = 800

const dedupeAndSortDensities = values =>
  Array.from(new Set([1, ...values])).sort()

export function calculateImageSizes(args) {
  const { width, height, file, layout, reporter } = args

  // check that all dimensions provided are positive
  const userDimensions = { width, height }
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
  } else if (layout === `fullWidth` || layout === `constrained`) {
    return responsiveImageSizes(args)
  } else {
    reporter.warn(
      `No valid layout was provided for the image at ${file.absolutePath}. Valid image layouts are fixed, fullWidth, and constrained.`
    )
    return []
  }
}
export function fixedImageSizes({
  file,
  imgDimensions,
  width,
  height,
  transformOptions = {},
  outputPixelDensities = DEFAULT_PIXEL_DENSITIES,
  reporter,
}) {
  let aspectRatio = imgDimensions.width / imgDimensions.height
  const { fit = `cover` } = transformOptions
  // Sort, dedupe and ensure there's a 1
  const densities = dedupeAndSortDensities(outputPixelDensities)

  // If both are provided then we need to check the fit
  if (width && height) {
    const calculated = getDimensionsAndAspectRatio(imgDimensions, {
      width,
      height,
      fit,
    })
    width = calculated.width
    height = calculated.height
    aspectRatio = calculated.aspectRatio
  }
  if (!width && !height) {
    width = 400
  }

  // if no width is passed, we need to resize the image based on the passed height
  if (!width) {
    width = Math.round(height * aspectRatio)
  }

  const originalWidth = width // will use this for presentationWidth, don't want to lose it
  const isTopSizeOverriden =
    imgDimensions.width < width || imgDimensions.height < height

  // If the image is smaller than what's requested, warn the user that it's being processed as such
  // print out this message with the necessary information before we overwrite it for sizing
  if (isTopSizeOverriden) {
    const fixedDimension = imgDimensions.width < width ? `width` : `height`
    reporter.warn(`
                       The requested ${fixedDimension} "${
      fixedDimension === `width` ? width : height
    }px" for a resolutions field for
                       the file ${file.absolutePath}
                       was larger than the actual image ${fixedDimension} of ${
      imgDimensions[fixedDimension]
    }px!
                       If possible, replace the current image with a larger one.
                       `)

    if (fixedDimension === `width`) {
      width = imgDimensions.width
      height = Math.round(width / aspectRatio)
    } else {
      height = imgDimensions.height
      width = height * aspectRatio
    }
  }

  const sizes = densities
    .filter(size => size >= 1) // remove smaller densities because fixed images don't need them
    .map(density => Math.round(density * width))
    .filter(size => size <= imgDimensions.width)

  return {
    sizes,
    aspectRatio,
    presentationWidth: originalWidth,
    presentationHeight: Math.round(originalWidth / aspectRatio),
    unscaledWidth: width,
  }
}

export function responsiveImageSizes({
  imgDimensions,
  width,
  height,
  transformOptions = {},
  outputPixelDensities = DEFAULT_PIXEL_DENSITIES,
  breakpoints,
  layout,
}) {
  const { fit = `cover` } = transformOptions

  let sizes
  let aspectRatio = imgDimensions.width / imgDimensions.height
  // Sort, dedupe and ensure there's a 1
  const densities = dedupeAndSortDensities(outputPixelDensities)

  // If both are provided then we need to check the fit
  if (width && height) {
    const calculated = getDimensionsAndAspectRatio(imgDimensions, {
      width: width,
      height: height,
      fit,
    })
    width = calculated.width
    height = calculated.height
    aspectRatio = calculated.aspectRatio
  }

  // Case 1: width or height were passed in, make sure it isn't larger than the actual image
  width = width && Math.min(width, imgDimensions.width)
  height = height && Math.min(height, imgDimensions.height)

  // Case 2: neither width or height were passed in, use default size
  if (!width && !height) {
    width = Math.min(DEFAULT_FLUID_SIZE, imgDimensions.width)
    height = width / aspectRatio
  }

  // if it still hasn't been found, calculate width from the derived height
  if (!width) {
    width = height * aspectRatio
  }

  const originalWidth = width
  const isTopSizeOverriden =
    imgDimensions.width < width || imgDimensions.height < height
  if (isTopSizeOverriden) {
    width = imgDimensions.width
    height = imgDimensions.height
  }

  width = Math.round(width)

  if (breakpoints?.length > 0) {
    sizes = breakpoints.filter(size => size <= imgDimensions.width)

    // If a larger breakpoint has been filtered-out, add the actual image width instead
    if (
      sizes.length < breakpoints.length &&
      !sizes.includes(imgDimensions.width)
    ) {
      sizes.push(imgDimensions.width)
    }
  } else {
    sizes = densities.map(density => Math.round(density * width))
    sizes = sizes.filter(size => size <= imgDimensions.width)
  }

  // ensure that the size passed in is included in the final output
  if (layout === `constrained` && !sizes.includes(width)) {
    sizes.push(width)
  }
  sizes = sizes.sort((a, b) => a - b)
  return {
    sizes,
    aspectRatio,
    presentationWidth: originalWidth,
    presentationHeight: Math.round(originalWidth / aspectRatio),
    unscaledWidth: width,
  }
}

export const getSizes = (width, layout) => {
  switch (layout) {
    // If screen is wider than the max size, image width is the max size,
    // otherwise it's the width of the screen
    case `constrained`:
      return `(min-width: ${width}px) ${width}px, 100vw`

    // Image is always the same width, whatever the size of the screen
    case `fixed`:
      return `${width}px`

    // Image is always the width of the screen
    case `fullWidth`:
      return `100vw`

    default:
      return undefined
  }
}

export const getSrcSet = images =>
  images.map(image => `${image.src} ${image.width}w`).join(`,\n`)

export function getDimensionsAndAspectRatio(dimensions, options) {
  // Calculate the eventual width/height of the image.
  const imageAspectRatio = dimensions.width / dimensions.height

  let width = options.width
  let height = options.height

  switch (options.fit) {
    case sharp.fit.fill: {
      width = options.width ? options.width : dimensions.width
      height = options.height ? options.height : dimensions.height
      break
    }
    case sharp.fit.inside: {
      const widthOption = options.width
        ? options.width
        : Number.MAX_SAFE_INTEGER
      const heightOption = options.height
        ? options.height
        : Number.MAX_SAFE_INTEGER

      width = Math.min(widthOption, Math.round(heightOption * imageAspectRatio))
      height = Math.min(
        heightOption,
        Math.round(widthOption / imageAspectRatio)
      )
      break
    }
    case sharp.fit.outside: {
      const widthOption = options.width ? options.width : 0
      const heightOption = options.height ? options.height : 0

      width = Math.max(widthOption, Math.round(heightOption * imageAspectRatio))
      height = Math.max(
        heightOption,
        Math.round(widthOption / imageAspectRatio)
      )
      break
    }

    default: {
      if (options.width && !options.height) {
        width = options.width
        height = Math.round(options.width / imageAspectRatio)
      }

      if (options.height && !options.width) {
        width = Math.round(options.height * imageAspectRatio)
        height = options.height
      }
    }
  }

  return {
    width,
    height,
    aspectRatio: width / height,
  }
}
