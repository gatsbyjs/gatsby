import type { ISharpGatsbyImageArgs, Fit } from "gatsby-plugin-image"
import { pickBy, defaults, mergeWith, omitBy, isNil, identity } from "lodash"
import type { FailOnOptions, SharpOptions } from "sharp"

export type PluginOptionsDefaults = Pick<
  ISharpGatsbyImageArgs,
  | "formats"
  | "placeholder"
  | "quality"
  | "breakpoints"
  | "backgroundColor"
  | "tracedSVGOptions"
  | "blurredOptions"
  | "jpgOptions"
  | "pngOptions"
  | "webpOptions"
  | "avifOptions"
>

export interface ISharpPluginOptions {
  base64Width?: number
  forceBase64Format?: "png" | "webp" | "jpg" | string
  useMozJpeg?: boolean
  stripMetadata?: boolean
  lazyImageGeneration?: boolean
  defaultQuality: number
  failOn?: SharpOptions["failOn"]
  defaults?: PluginOptionsDefaults
}

interface IDuotoneArgs {
  highlight: string
  shadow: string
  opacity?: number
}

export interface ITransformArgs {
  height: number
  width: number
  cropFocus?: number | string
  toFormat: string
  pngCompressionLevel?: number
  quality?: number
  jpegQuality?: number
  pngQuality?: number
  webpQuality?: number
  jpegProgressive?: boolean
  grayscale?: boolean
  rotate?: number
  trim?: number
  duotone?: IDuotoneArgs
  background?: string
  fit?: Fit
  pathPrefix?: string
  maxHeight?: number
  maxWidth?: number
  base64Width?: number
}

interface IGeneralArgs extends ITransformArgs {
  base64: boolean
  pathPrefix: string
  toFormatBase64: string
  pngCompressionSpeed?: number
}

// Plugin options are loaded onPreBootstrap in gatsby-node
const pluginDefaults = {
  base64Width: 20,
  forceBase64Format: ``, // valid formats: png,jpg,webp
  useMozJpeg: process.env.GATSBY_JPEG_ENCODER === `MOZJPEG`,
  stripMetadata: true,
  lazyImageGeneration: true,
  defaultQuality: 50,
  failOn: `warning` as FailOnOptions,
}

const generalArgs: Partial<IGeneralArgs> = {
  quality: 50,
  jpegQuality: undefined,
  pngQuality: undefined,
  webpQuality: undefined,
  jpegProgressive: true,
  pngCompressionLevel: 9,
  // default is 4 (https://github.com/kornelski/pngquant/blob/4219956d5e080be7905b5581314d913d20896934/rust/bin.rs#L61)
  pngCompressionSpeed: 4,
  base64: true,
  grayscale: false,
  duotone: undefined,
  pathPrefix: ``,
  toFormat: ``,
  toFormatBase64: ``,
  rotate: 0,
}

let pluginOptions: ISharpPluginOptions = Object.assign({}, pluginDefaults)
export const setPluginOptions = (
  opts: Record<string, string>
): ISharpPluginOptions => {
  pluginOptions = Object.assign({}, pluginOptions, opts)
  generalArgs.quality = pluginOptions.defaultQuality

  return pluginOptions
}

export const getPluginOptions = (): ISharpPluginOptions => pluginOptions
export const getPluginOptionsDefaults = (): ISharpPluginOptions =>
  pluginDefaults

/**
 * Creates a transform object
 */
export const createTransformObject = (
  args: ITransformArgs
): Partial<ITransformArgs> => {
  const options = {
    height: args.height,
    width: args.width,
    cropFocus: args.cropFocus,
    toFormat: args.toFormat,
    pngCompressionLevel:
      args.pngCompressionLevel || generalArgs.pngCompressionLevel,
    quality: args.quality,
    jpegQuality: args.jpegQuality,
    pngQuality: args.pngQuality,
    webpQuality: args.webpQuality,
    jpegProgressive: args.jpegProgressive || generalArgs.jpegProgressive,
    grayscale: args.grayscale || generalArgs.grayscale,
    rotate: args.rotate,
    trim: args.trim ? args.trim : undefined,
    duotone: args.duotone ? args.duotone : null,
    fit: args.fit,
    background: args.background,
  }

  // get all non falsey values
  return pickBy(options, identity)
}

/**
 * Used for gatsbyImageData and StaticImage only
 */
export const mergeDefaults = (
  args: ISharpGatsbyImageArgs
): PluginOptionsDefaults & ISharpGatsbyImageArgs =>
  doMergeDefaults(args, pluginOptions.defaults)

const customizer = <T>(objValue: unknown, srcValue: T): T | undefined =>
  Array.isArray(objValue) ? srcValue : undefined

export function doMergeDefaults(
  args: ISharpGatsbyImageArgs,
  defaults?: PluginOptionsDefaults
): PluginOptionsDefaults & ISharpGatsbyImageArgs {
  if (!defaults) {
    return args
  }
  return mergeWith({}, defaults, args, customizer)
}

export const healOptions = (
  {
    defaultQuality: quality,
    base64Width,
  }: Pick<ISharpPluginOptions, "defaultQuality" | "base64Width">,
  args: ITransformArgs,
  fileExtension = ``,
  defaultArgs = {}
): Partial<IGeneralArgs> & {
  quality: number
} & ITransformArgs => {
  const options = defaults({}, args, { quality }, defaultArgs, generalArgs)
  // @ts-ignore - parseInt as safeguard, expects string tho
  options.quality = parseInt(options.quality, 10)
  // @ts-ignore - parseInt as safeguard, expects string tho
  options.pngCompressionLevel = parseInt(options.pngCompressionLevel, 10)
  // @ts-ignore - parseInt as safeguard, expects string tho
  options.pngCompressionSpeed = parseInt(options.pngCompressionSpeed, 10)
  options.toFormat = options.toFormat.toLowerCase()
  options.toFormatBase64 = options.toFormatBase64?.toLowerCase()
  options.base64Width = options.base64Width || base64Width

  // when toFormat is not set we set it based on fileExtension
  if (options.toFormat === ``) {
    if (!fileExtension) {
      throw new Error(
        `toFormat seems to be empty, we need a fileExtension to set it.`
      )
    }
    options.toFormat = fileExtension.toLowerCase()

    if (fileExtension === `jpeg`) {
      options.toFormat = `jpg`
    }
  }

  // only set width to 400 if neither width nor height is passed
  if (options.width === undefined && options.height === undefined) {
    options.width = 400
  }
  if (options.width !== undefined) {
    // @ts-ignore - parseInt as safeguard, expects string tho
    options.width = parseInt(options.width, 10)
  }
  if (options.height !== undefined) {
    // @ts-ignore - parseInt as safeguard, expects string tho
    options.height = parseInt(options.height, 10)
  }

  // only set maxWidth to 800 if neither maxWidth nor maxHeight is passed
  if (options.maxWidth === undefined && options.maxHeight === undefined) {
    options.maxWidth = 800
  } else if (options.maxWidth !== undefined) {
    // @ts-ignore - parseInt as safeguard, expects string tho
    options.maxWidth = parseInt(options.maxWidth, 10)
  } else if (options.maxHeight !== undefined) {
    // @ts-ignore - parseInt as safeguard, expects string tho
    options.maxHeight = parseInt(options.maxHeight, 10)
  }

  ;[`width`, `height`, `maxWidth`, `maxHeight`].forEach(prop => {
    if (typeof options[prop] !== `undefined` && options[prop] < 1) {
      throw new Error(
        `${prop} has to be a positive int larger than zero (> 0), now it's ${options[prop]}`
      )
    }
  })
  return options
}

/**
 * Removes all default values so we have the smallest transform args
 */
export const removeDefaultValues = (
  args: ITransformArgs,
  pluginOptions: ISharpPluginOptions
): Partial<ITransformArgs> => {
  const options = {
    height: args.height,
    width: args.width,
    cropFocus: args.cropFocus,
    toFormat: args.toFormat,
    pngCompressionLevel:
      args.pngCompressionLevel !== generalArgs.pngCompressionLevel
        ? args.pngCompressionLevel
        : undefined,
    quality:
      args.quality !== pluginOptions.defaultQuality ? args.quality : undefined,
    jpegQuality: args.jpegQuality,
    pngQuality: args.pngQuality,
    webpQuality: args.webpQuality,
    jpegProgressive:
      args.jpegProgressive !== generalArgs.jpegProgressive
        ? args.jpegProgressive
        : undefined,
    grayscale:
      args.grayscale !== generalArgs.grayscale ? args.grayscale : undefined,
    rotate: args.rotate !== generalArgs.rotate ? args.rotate : undefined,
    trim: args.trim ? args.trim : undefined,
    duotone: args.duotone || undefined,
    fit: args.fit,
    background: args.background,
  }

  return omitBy(options, isNil)
}
