const reporter = require(`gatsby-cli/lib/reporter`)
import { Stats } from "webpack"

const stageCodeToReadableLabel = {
  "build-javascript": `Generating JavaScript bundles`,
  "build-html": `Generating SSR bundle`,
  develop: `Generating development JavaScript bundle`,
} as const

type Stage = keyof typeof stageCodeToReadableLabel
type StageLabel = typeof stageCodeToReadableLabel[Stage]

interface ITransformedWebpackError {
  id: "98123"
  filePath?: string
  location?: {
    start: string
  }
  context: {
    stage: Stage
    stageLabel: StageLabel
    message?: string
  }
}
const transformWebpackError = (
  stage: keyof typeof stageCodeToReadableLabel,
  webpackError: any
): ITransformedWebpackError => {
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

export const structureWebpackErrors = (
  stage: Stage,
  webpackError: any
): ITransformedWebpackError[] | ITransformedWebpackError => {
  if (Array.isArray(webpackError)) {
    return webpackError.map(e => transformWebpackError(stage, e))
  }

  return transformWebpackError(stage, webpackError)
}

export const reportWebpackWarnings = (stats: Stats): void => {
  stats.compilation.warnings.forEach(webpackWarning => {
    if (webpackWarning.warning) {
      // grab inner Exception if it exists
      reporter.warn(webpackWarning.warning.toString())
    } else {
      reporter.warn(webpackWarning.message)
    }
  })
}
