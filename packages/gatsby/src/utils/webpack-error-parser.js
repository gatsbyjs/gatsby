const stageCodeToReadableLabel = {
  "build-javascript": `Generating JavaScript bundles`,
  "build-html": `Generating SSR bundle`,
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

module.exports = (stage, webpackError) => {
  if (Array.isArray(webpackError)) {
    return webpackError.map(e => transformWebpackError(stage, e))
  }

  return transformWebpackError(stage, webpackError)
}
