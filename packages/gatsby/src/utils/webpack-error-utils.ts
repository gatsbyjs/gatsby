import reporter from "gatsby-cli/lib/reporter"
import { Stats } from "webpack"
import { IMatch } from "../types"
import { Stage as StageEnum } from "../commands/types"

const stageCodeToReadableLabel: Record<StageEnum, string> = {
  [StageEnum.BuildJavascript]: `Generating JavaScript bundles`,
  [StageEnum.BuildHTML]: `Generating SSR bundle`,
  [StageEnum.DevelopHTML]: `Generating development SSR bundle`,
  [StageEnum.Develop]: `Generating development JavaScript bundle`,
}

interface ITransformedWebpackError {
  id: string
  filePath?: string
  location?: {
    start: string
  }
  context: {
    stage: StageEnum
    stageLabel: string
    sourceMessage?: string
    [key: string]: unknown
  }
}

const transformWebpackError = (
  stage: StageEnum,
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

  const webpackMessage = webpackError?.error?.message || webpackError?.message

  const shared = {
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
    // We use original error to display stack trace for the most part.
    // In case of webpack error stack will include internals of webpack
    // or one of loaders (for example babel-loader) and doesn't provide
    // much value to user, so it's purposely omitted.

    // error: webpackError?.error || webpackError,
  }

  let structured: ITransformedWebpackError | undefined

  for (const { regex, cb } of handlers) {
    const matched = webpackMessage?.match(regex)
    if (matched) {
      const match = cb(matched)

      structured = {
        id: match.id,
        ...shared,
        context: {
          ...shared.context,
          packageName: match.context.packageName,
          sourceMessage: match.context.sourceMessage,
        },
      }

      break
    }
  }

  // If we haven't found any known error
  if (!structured) {
    return {
      id: `98123`,
      ...shared,
    }
  }

  return structured
}

export const structureWebpackErrors = (
  stage: StageEnum,
  webpackError: any
): Array<ITransformedWebpackError> | ITransformedWebpackError => {
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
