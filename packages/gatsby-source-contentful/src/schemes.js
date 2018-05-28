const { GraphQLEnumType } = require(`graphql`)

const ImageFormatType = new GraphQLEnumType({
  name: `ContentfulImageFormat`,
  values: {
    NO_CHANGE: { value: `` },
    JPG: { value: `jpg` },
    PNG: { value: `png` },
    WEBP: { value: `webp` },
  },
})

const ImageResizingBehavior = new GraphQLEnumType({
  name: `ImageResizingBehavior`,
  values: {
    NO_CHANGE: {
      value: ``,
    },
    PAD: {
      value: `pad`,
      description: `Same as the default resizing, but adds padding so that the generated image has the specified dimensions.`,
    },

    CROP: {
      value: `crop`,
      description: `Crop a part of the original image to match the specified size.`,
    },
    FILL: {
      value: `fill`,
      description: `Crop the image to the specified dimensions, if the original image is smaller than these dimensions, then the image will be upscaled.`,
    },
    THUMB: {
      value: `thumb`,
      description: `When used in association with the f parameter below, creates a thumbnail from the image based on a focus area.`,
    },
    SCALE: {
      value: `scale`,
      description: `Scale the image regardless of the original aspect ratio.`,
    },
  },
})

const ImageCropFocusType = new GraphQLEnumType({
  name: `ContentfulImageCropFocus`,
  values: {
    TOP: { value: `top` },
    TOP_LEFT: { value: `top_left` },
    TOP_RIGHT: { value: `top_right` },
    BOTTOM: { value: `bottom` },
    BOTTOM_RIGHT: { value: `bottom_left` },
    BOTTOM_LEFT: { value: `bottom_right` },
    RIGHT: { value: `right` },
    LEFT: { value: `left` },
    FACES: { value: `faces` },
  },
})

module.exports = {
  ImageFormatType,
  ImageResizingBehavior,
  ImageCropFocusType,
}
