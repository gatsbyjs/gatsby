const ProgressBar = require(`progress`)

// TODO remove in V3
function createGatsbyProgressOrFallbackToExternalProgressBar(
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
const createOrGetProgressBar = reporter => {
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

exports.createGatsbyProgressOrFallbackToExternalProgressBar = createGatsbyProgressOrFallbackToExternalProgressBar
exports.createOrGetProgressBar = createOrGetProgressBar
exports.getProgressBar = () => progressBar
