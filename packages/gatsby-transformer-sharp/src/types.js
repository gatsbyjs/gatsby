const {
  GraphQLInputObjectType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLEnumType,
  GraphQLNonNull,
} = require(`gatsby/graphql`)
const sharp = require(`./safe-sharp`)
const { Potrace } = require(`potrace`)

export const ImageFormatType = new GraphQLEnumType({
  name: `ImageFormat`,
  values: {
    NO_CHANGE: { value: `` },
    JPG: { value: `jpg` },
    PNG: { value: `png` },
    WEBP: { value: `webp` },
  },
})

export const ImageLayoutType = new GraphQLEnumType({
  name: `ImageLayout`,
  values: {
    FIXED: { value: `fixed` },
    FLUID: { value: `fluid` },
    CONSTRAINED: { value: `constrained` },
  },
})

export const ImagePlaceholderType = new GraphQLEnumType({
  name: `ImagePlaceholder`,
  values: {
    DOMINANT_COLOR: { value: `dominantColor` },
    TRACED_SVG: { value: `tracedSVG` },
    BASE64: { value: `base64` },
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

export const DuotoneGradientType = new GraphQLInputObjectType({
  name: `DuotoneGradient`,
  fields: () => {
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
  fields: () => {
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
