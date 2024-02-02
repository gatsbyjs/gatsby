import chalk from "chalk"
import _ from "lodash"

import type { IPluginOptions, IProcessedPluginOptions } from "./types/plugin"

const DEFAULT_PAGE_LIMIT = 1000

const defaultOptions: Omit<IPluginOptions, "spaceId" | "accessToken"> = {
  host: `cdn.contentful.com`,
  environment: `master`,
  downloadLocal: false,
  localeFilter: () => true,
  contentTypeFilter: () => true,
  pageLimit: DEFAULT_PAGE_LIMIT,
  useNameForId: true,
  contentTypePrefix: `ContentfulContentType`,
  enableMarkdownDetection: true,
  markdownFields: [],
  enforceRequiredFields: true,
}

/**
 * Mask majority of input to not leak any secrets
 * @param {string} input
 * @returns {string} masked text
 */
const maskText = (input: string): string => {
  // show just 25% of string up to 4 characters
  const hiddenCharactersLength =
    input.length - Math.min(4, Math.floor(input.length * 0.25))

  return `${`*`.repeat(hiddenCharactersLength)}${input.substring(
    hiddenCharactersLength
  )}`
}

const createPluginConfig = (
  pluginOptions: Partial<IPluginOptions>
): IProcessedPluginOptions => {
  const conf = { ...defaultOptions, ...pluginOptions }

  return {
    get: (key): unknown => conf[key],
    getOriginalPluginOptions: (): IPluginOptions =>
      pluginOptions as IPluginOptions,
  }
}

const maskedFields = [`accessToken`, `spaceId`]

const formatPluginOptionsForCLI = (
  pluginOptions: IPluginOptions,
  errors = {}
): string => {
  const optionKeys = new Set(
    Object.keys(pluginOptions)
      .concat(Object.keys(defaultOptions))
      .concat(Object.keys(errors))
  )

  const getDisplayValue = (key: string): string => {
    const formatValue = (value: unknown): string => {
      if (_.isFunction(value)) {
        return `[Function]`
      } else if (maskedFields.includes(key) && typeof value === `string`) {
        return JSON.stringify(maskText(value))
      }
      return JSON.stringify(value)
    }

    if (typeof pluginOptions[key] !== `undefined`) {
      return chalk.green(formatValue(pluginOptions[key]))
    } else if (typeof defaultOptions[key] !== `undefined`) {
      return chalk.dim(formatValue(defaultOptions[key]))
    }

    return chalk.dim(`undefined`)
  }

  const lines: Array<string> = []
  optionKeys.forEach(key => {
    if (key === `plugins`) {
      // skip plugins field automatically added by gatsby
      return
    }

    const defaultValue =
      typeof pluginOptions[key] === `undefined` &&
      typeof defaultOptions[key] !== `undefined`
        ? chalk.dim(` (default value)`)
        : ``
    const displayValue = getDisplayValue(key)
    const errorValue =
      typeof errors[key] !== `undefined` ? ` - ${chalk.red(errors[key])}` : ``

    lines.push(`${key}${defaultValue}: ${displayValue}${errorValue}`)
  })
  return lines.join(`\n`)
}

export {
  defaultOptions,
  formatPluginOptionsForCLI,
  maskText,
  createPluginConfig,
}
