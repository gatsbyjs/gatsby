import {
  GraphQLNonNull,
  GraphQLJSON,
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  GraphQLFieldConfigArgumentMap,
  GraphQLEnumType,
  GraphQLFloat,
} from "gatsby/graphql"
import { stripIndent } from "common-tags"

export const ImageFormatType = new GraphQLEnumType({
  name: `GatsbyImageFormat`,
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
  name: `GatsbyImageLayout`,
  values: {
    FIXED: { value: `fixed` },
    FLUID: { value: `fluid` },
    CONSTRAINED: { value: `constrained` },
  },
})

export const ImagePlaceholderType = new GraphQLEnumType({
  name: `GatsbyImagePlaceholder`,
  values: {
    DOMINANT_COLOR: { value: `dominantColor` },
    TRACED_SVG: { value: `tracedSVG` },
    BLURRED: { value: `blurred` },
    NONE: { value: `none` },
  },
})

export function getGatsbyImageFieldConfig<TSource, TContext>(
  resolve: GraphQLFieldResolver<TSource, TContext>,
  extraArgs?: GraphQLFieldConfigArgumentMap
): GraphQLFieldConfig<TSource, TContext> {
  return {
    type: new GraphQLNonNull(GraphQLJSON),
    args: {
      layout: {
        type: ImageLayoutType,
        defaultValue: `fixed`,
        description: stripIndent`
            The layout for the image.
            FIXED: A static image sized, that does not resize according to the screen width
            FLUID: The image resizes to fit its container. Pass a "sizes" option if it isn't going to be the full width of the screen. 
            CONSTRAINED: Resizes to fit its container, up to a maximum width, at which point it will remain fixed in size.
            `,
      },
      width: {
        type: GraphQLInt,
        description: stripIndent`
        The display width of the generated image for layout = FIXED, and the display width of the largest image for layout = CONSTRAINED.  
        The actual largest image resolution will be this value multiplied by the largest value in outputPixelDensities
        Ignored if layout = FLUID.
        `,
      },
      height: {
        type: GraphQLInt,
        description: stripIndent`
        If set, the height of the generated image. If omitted, it is calculated from the supplied width, matching the aspect ratio of the source image.`,
      },
      placeholder: {
        type: ImagePlaceholderType,
        defaultValue: `blurred`,
        description: stripIndent`
            Format of generated placeholder image, displayed while the main image loads. 
            BLURRED: a blurred, low resolution image, encoded as a base64 data URI (default)
            DOMINANT_COLOR: a solid color, calculated from the dominant color of the image. 
            TRACED_SVG: a low-resolution traced SVG of the image.
            NONE: no placeholder. Set "background" to use a fixed background color.`,
      },
      formats: {
        type: GraphQLList(ImageFormatType),
        description: stripIndent`
            The image formats to generate. Valid values are AUTO (meaning the same format as the source image), JPG, PNG, WEBP and AVIF. 
            The default value is [AUTO, WEBP], and you should rarely need to change this. Take care if you specify JPG or PNG when you do
            not know the formats of the source images, as this could lead to unwanted results such as converting JPEGs to PNGs. Specifying 
            both PNG and JPG is not supported and will be ignored. AVIF support is currently experimental.
        `,
        defaultValue: [`auto`, `webp`],
      },
      outputPixelDensities: {
        type: GraphQLList(GraphQLFloat),
        description: stripIndent`
            A list of image pixel densities to generate. It will never generate images larger than the source, and will always include a 1x image. 
            Default is [ 1, 2 ] for fixed images, meaning 1x, 2x, 3x, and [0.25, 0.5, 1, 2] for fluid. In this case, an image with a fluid layout and width = 400 would generate images at 100, 200, 400 and 800px wide
            `,
      },
      sizes: {
        type: GraphQLString,
        defaultValue: ``,
        description: stripIndent`
            The "sizes" property, passed to the img tag. This describes the display size of the image. 
            This does not affect the generated images, but is used by the browser to decide which images to download. You can leave this blank for fixed images, or if the responsive image
            container will be the full width of the screen. In these cases we will generate an appropriate value.
        `,
      },
      ...extraArgs,
    },
    resolve,
  }
}
