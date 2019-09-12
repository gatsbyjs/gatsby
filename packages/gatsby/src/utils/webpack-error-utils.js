const reporter = require(`gatsby-cli/lib/reporter`)

const stageCodeToReadableLabel = {
  "build-javascript": `Generating JavaScript bundles`,
  "build-html": `Generating SSR bundle`,
  develop: `Generating development JavaScript bundle`,
}

const transformWebpackError = (stage, webpackError) => {
  return {
    id: `98123`,
    filePath: webpackError?.module?.resource,
    location:
      webpackError?.module?.resource && webpackError?.error?.loc
        ? {
            start: webpackError.error.loc,
          }
        : undefined,
    context: {
      stage,
      stageLabel: stageCodeToReadableLabel[stage],
      message: webpackError?.error?.message || webpackError?.message,
    },

    // We use original error to display stack trace for the most part.
    // In case of webpack error stack will include internals of webpack
    // or one of loaders (for example babel-loader) and doesn't provide
    // much value to user, so it's purposely omitted.
    // error: webpackError?.error || webpackError,
  }
}

exports.structureWebpackErrors = (stage, webpackError) => {
  if (Array.isArray(webpackError)) {
    return webpackError.map(e => transformWebpackError(stage, e))
  }

  return transformWebpackError(stage, webpackError)
}

exports.reportWebpackWarnings = stats => {
  stats.compilation.warnings.forEach(webpackWarning => {
    if (webpackWarning.warning) {
      // grab inner Exception if it exists
      reporter.warn(webpackWarning.warning.toString())
    } else {
      reporter.warn(webpackWarning.message)
    }
  })
}
