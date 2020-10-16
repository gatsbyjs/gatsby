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

export const calculateImageSizes = ({
  file,
  imgDimensions,
  width,
  maxWidth,
  height,
  maxHeight,
  layout,
  outputPixelDensities = [1, 2, 3],
  srcSetBreakpoints,
}) => {
  let sizes
  const aspectRatio = imgDimensions.width / imgDimensions.height
  // Sort, dedupe and ensure there's a 1
  const densities = Array.from(new Set([1, ...outputPixelDensities])).sort()

  if (layout === `fixed`) {
    // FIXED
    // if no width is passed, we need to resize the image based on the passed height
    const fixedDimension = width === undefined ? `height` : `width`
    const fixedValue = fixedDimension === `height` ? height : width
    if (fixedValue < 1) {
      throw new Error(
        `${fixedDimension} has to be a positive int larger than zero (> 0), now it's ${fixedValue}`
      )
    }

    if (!width) {
      width = height * aspectRatio
    }
    console.log(width)
    console.log(densities)

    sizes = densities
      .map(density => density * width)
      .filter(size => size <= imgDimensions.width)

    // If there's no fixed images after filtering (e.g. image is smaller than what's
    // requested, add back the original so there's at least something)
    if (sizes.length === 0) {
      sizes.push(width)
      console.warn(`
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
  } else if (layout === `fluid`) {
    // FLUID
    // if no maxWidth is passed, we need to resize the image based on the passed maxHeight
    const fixedDimension = maxWidth === undefined ? `maxHeight` : `maxWidth`
    if (maxWidth) {
      maxWidth = Math.min(maxWidth, imgDimensions.width)
    } else if (maxWidth === 0) {
      // 0 is falsy, don't let it get reassigned so we can provide a clear error
    } else {
      maxWidth = maxHeight * aspectRatio
    }
    if (maxHeight) {
      Math.min(maxHeight, imgDimensions.height)
    } else if (maxWidth === 0) {
      // 0 is falsy, don't let it get reassigned so we can provide a clear error
    } else {
      maxHeight = undefined
    }

    const fixedValue = fixedDimension === `maxHeight` ? maxHeight : maxWidth
    if (fixedValue < 1) {
      throw new Error(
        `${fixedDimension} has to be a positive int larger than zero (> 0), now it's ${fixedValue}`
      )
    }

    // Create sizes (in width) for the image if no custom breakpoints are
    // provided. If the max width of the container for the rendered markdown file
    // is 800px, the sizes would then be: 200, 400, 800, 1200, 1600.
    //
    // This is enough sizes to provide close to the optimal image size for every
    // device size / screen resolution while (hopefully) not requiring too much
    // image processing time (Sharp has optimizations thankfully for creating
    // multiple sizes of the same input file)

    // use standard breakpoints if no custom breakpoints are specified
    if (!srcSetBreakpoints || !srcSetBreakpoints.length) {
      sizes = densities.map(density => density * imgDimensions.width)
      sizes = sizes.filter(size => size <= maxWidth)
    } else {
      sizes = srcSetBreakpoints.filter(size => size <= maxWidth)
    }

    // ensure that the passed in size is included in the final output
    if (!sizes.includes(maxWidth)) {
      sizes.push(maxWidth)
    }
    sizes = sizes.sort((a, b) => a - b)
  } else if (layout === `constrained`) {
    // TODO
  } else {
    console.warn(
      `No valid layout was provided. Valid image layouts are fixed, fluid, and constrained.`
    )
  }
  return sizes
}
