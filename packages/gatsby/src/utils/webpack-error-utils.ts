import reporter from "gatsby-cli/lib/reporter"
import { Stats } from "webpack"
import { IMatch } from "../types"

const stageCodeToReadableLabel = {
  "build-javascript": `Generating JavaScript bundles`,
  "build-html": `Generating SSR bundle`,
  develop: `Generating development JavaScript bundle`,
} as const

type Stage = keyof typeof stageCodeToReadableLabel
type StageLabel = typeof stageCodeToReadableLabel[Stage]

interface ITransformedWebpackError {
  id: string
  filePath?: string
  location?: {
    start: string
  }
  context: {
    stage: Stage
    stageLabel: StageLabel
    sourceMessage?: string
    [key: string]: string | boolean | undefined
  }
}
const transformWebpackError = (
  stage: keyof typeof stageCodeToReadableLabel,
  webpackError: any
): ITransformedWebpackError => {
  const handlers = [
    {
      regex: /Can't resolve '(.*?)' in '(.*?)'/m,
      cb: (match): IMatch => {
        return {
          id: `98124`,
          context: {
            sourceMessage: match[0],
            packageName: match[1],
          },
        }
      },
    },
  ]

  // We use original error to display stack trace for the most part.
  // In case of webpack error stack will include internals of webpack
  // or one of loaders (for example babel-loader) and doesn't provide
  // much value to user, so it's purposely omitted.
  // error: webpackError?.error || webpackError,
  const webpackMessage = webpackError?.error?.message || webpackError?.message

  let structured: ITransformedWebpackError | undefined

  for (const { regex, cb } of handlers) {
    const matched = webpackMessage?.match(regex)
    if (matched) {
      const match = cb(matched)
      structured = {
        id: match.id,
        filePath: webpackError?.module?.resource,
        location:
          webpackError?.module?.resource && webpackError?.error?.loc
            ? {
                start: webpackError.error.loc,
              }
            : undefined,
        context: {
          sourceMessage: match.context.sourceMessage,
          packageName: match.context.packageName,
          stage,
          stageLabel: stageCodeToReadableLabel[stage],
        },
      }

      break
    }
  }

  // If we haven't found any known error
  if (!structured) {
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
        sourceMessage: webpackMessage,
      },
    }
  }

  return structured
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
