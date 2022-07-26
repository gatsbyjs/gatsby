import {
  GraphQLInputObjectType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLInputFieldConfigMap,
} from "gatsby/graphql"
import { Potrace } from "@gatsbyjs/potrace"
import type Sharp from "sharp"

const sharp: typeof Sharp = require(`./safe-sharp`)
const DEFAULT_PNG_COMPRESSION_SPEED = 4

export const ImageFormatType = new GraphQLEnumType({
  name: `ImageFormat`,
  values: {
    NO_CHANGE: { value: `` },
    AUTO: { value: `` },
    JPG: { value: `jpg` },
    PNG: { value: `png` },
    WEBP: { value: `webp` },
    AVIF: { value: `avif` },
  },
})

export const ImageLayoutType = new GraphQLEnumType({
  name: `ImageLayout`,
  values: {
    FIXED: { value: `fixed` },
    FULL_WIDTH: { value: `fullWidth` },
    CONSTRAINED: { value: `constrained` },
  },
})

export const ImagePlaceholderType = new GraphQLEnumType({
  name: `ImagePlaceholder`,
  values: {
    DOMINANT_COLOR: { value: `dominantColor` },
    TRACED_SVG: { value: `tracedSVG` },
    BLURRED: { value: `blurred` },
    NONE: { value: `none` },
  },
})

export const ImageFitType = new GraphQLEnumType({
  name: `ImageFit`,
  values: {
    COVER: { value: sharp.fit.cover },
    CONTAIN: { value: sharp.fit.contain },
    FILL: { value: sharp.fit.fill },
    INSIDE: { value: sharp.fit.inside },
    OUTSIDE: { value: sharp.fit.outside },
  },
})

export const ImageCropFocusType = new GraphQLEnumType({
  name: `ImageCropFocus`,
  values: {
    CENTER: { value: sharp.gravity.center },
    NORTH: { value: sharp.gravity.north },
    NORTHEAST: { value: sharp.gravity.northeast },
    EAST: { value: sharp.gravity.east },
    SOUTHEAST: { value: sharp.gravity.southeast },
    SOUTH: { value: sharp.gravity.south },
    SOUTHWEST: { value: sharp.gravity.southwest },
    WEST: { value: sharp.gravity.west },
    NORTHWEST: { value: sharp.gravity.northwest },
    ENTROPY: { value: sharp.strategy.entropy },
    ATTENTION: { value: sharp.strategy.attention },
  },
})

export const PNGOptionsType = new GraphQLInputObjectType({
  name: `PNGOptions`,
  fields: (): GraphQLInputFieldConfigMap => {
    return {
      quality: {
        type: GraphQLInt,
      },
      compressionSpeed: {
        type: GraphQLInt,
        defaultValue: DEFAULT_PNG_COMPRESSION_SPEED,
      },
    }
  },
})

export const JPGOptionsType = new GraphQLInputObjectType({
  name: `JPGOptions`,
  fields: (): GraphQLInputFieldConfigMap => {
    return {
      quality: {
        type: GraphQLInt,
      },
      progressive: {
        type: GraphQLBoolean,
        defaultValue: true,
      },
    }
  },
})

export const BlurredOptionsType = new GraphQLInputObjectType({
  name: `BlurredOptions`,
  fields: (): GraphQLInputFieldConfigMap => {
    return {
      width: {
        type: GraphQLInt,
        description: `Width of the generated low-res preview. Default is 20px`,
      },
      toFormat: {
        type: ImageFormatType,
        description: `Force the output format for the low-res preview. Default is to use the same format as the input. You should rarely need to change this`,
      },
    }
  },
})

export const WebPOptionsType = new GraphQLInputObjectType({
  name: `WebPOptions`,
  fields: (): GraphQLInputFieldConfigMap => {
    return {
      quality: {
        type: GraphQLInt,
      },
    }
  },
})

export const AVIFOptionsType = new GraphQLInputObjectType({
  name: `AVIFOptions`,
  fields: (): GraphQLInputFieldConfigMap => {
    return {
      quality: {
        type: GraphQLInt,
      },
      lossless: {
        type: GraphQLBoolean,
      },
      speed: {
        type: GraphQLInt,
      },
    }
  },
})

export const DuotoneGradientType = new GraphQLInputObjectType({
  name: `DuotoneGradient`,
  fields: (): GraphQLInputFieldConfigMap => {
    return {
      highlight: { type: new GraphQLNonNull(GraphQLString) },
      shadow: { type: new GraphQLNonNull(GraphQLString) },
      opacity: { type: GraphQLInt },
    }
  },
})

export const PotraceTurnPolicyType = new GraphQLEnumType({
  name: `PotraceTurnPolicy`,
  values: {
    TURNPOLICY_BLACK: { value: Potrace.TURNPOLICY_BLACK },
    TURNPOLICY_WHITE: { value: Potrace.TURNPOLICY_WHITE },
    TURNPOLICY_LEFT: { value: Potrace.TURNPOLICY_LEFT },
    TURNPOLICY_RIGHT: { value: Potrace.TURNPOLICY_RIGHT },
    TURNPOLICY_MINORITY: { value: Potrace.TURNPOLICY_MINORITY },
    TURNPOLICY_MAJORITY: { value: Potrace.TURNPOLICY_MAJORITY },
  },
})

export const PotraceType = new GraphQLInputObjectType({
  name: `Potrace`,
  fields: (): GraphQLInputFieldConfigMap => {
    return {
      turnPolicy: {
        type: PotraceTurnPolicyType,
      },
      turdSize: { type: GraphQLFloat },
      alphaMax: { type: GraphQLFloat },
      optCurve: { type: GraphQLBoolean },
      optTolerance: { type: GraphQLFloat },
      threshold: { type: GraphQLInt },
      blackOnWhite: { type: GraphQLBoolean },
      color: { type: GraphQLString },
      background: { type: GraphQLString },
    }
  },
})

export const TransformOptionsType = new GraphQLInputObjectType({
  name: `TransformOptions`,
  fields: (): GraphQLInputFieldConfigMap => {
    return {
      grayscale: {
        type: GraphQLBoolean,
        defaultValue: false,
      },
      duotone: {
        type: DuotoneGradientType,
        defaultValue: false,
      },
      rotate: {
        type: GraphQLInt,
        defaultValue: 0,
      },
      trim: {
        type: GraphQLFloat,
        defaultValue: false,
      },
      cropFocus: {
        type: ImageCropFocusType,
        defaultValue: sharp.strategy.attention,
      },
      fit: {
        type: ImageFitType,
        defaultValue: sharp.fit.cover,
      },
    }
  },
})
