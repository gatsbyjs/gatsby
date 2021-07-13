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
    AUTO: { value: `auto` },
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
    FULL_WIDTH: { value: `fullWidth` },
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

export interface IGatsbyGraphQLFieldConfig<TSource, TContext, TArgs> {
  description?: string
  type: string
  args?: Record<string, IGatsbyGraphQLResolverArgumentConfig>
  resolve: GraphQLFieldResolver<TSource, TContext, TArgs>
}
export interface IGatsbyGraphQLResolverArgumentConfig<TValue = any> {
  description?: string
  type: string | Array<string>
  defaultValue?: TValue
}

export function getGatsbyImageResolver<TSource, TContext, TArgs>(
  resolve: GraphQLFieldResolver<TSource, TContext, TArgs>,
  extraArgs?: Record<string, IGatsbyGraphQLResolverArgumentConfig>
): IGatsbyGraphQLFieldConfig<TSource, TContext, TArgs> {
  return {
    type: `JSON!`,
    args: {
      layout: {
        type: `enum GatsbyImageLayout { FIXED, FULL_WIDTH, CONSTRAINED }`,
        description: stripIndent`
            The layout for the image.
            FIXED: A static image sized, that does not resize according to the screen width
            FULL_WIDTH: The image resizes to fit its container. Pass a "sizes" option if it isn't going to be the full width of the screen. 
            CONSTRAINED: Resizes to fit its container, up to a maximum width, at which point it will remain fixed in size.
            `,
      },
      width: {
        type: `Int`,
        description: stripIndent`
        The display width of the generated image for layout = FIXED, and the display width of the largest image for layout = CONSTRAINED.  
        The actual largest image resolution will be this value multiplied by the largest value in outputPixelDensities
        Ignored if layout = FULL_WIDTH.
        `,
      },
      height: {
        type: `Int`,
        description: stripIndent`
        If set, the height of the generated image. If omitted, it is calculated from the supplied width, matching the aspect ratio of the source image.`,
      },
      aspectRatio: {
        type: `Float`,
        description: stripIndent`
        If set along with width or height, this will set the value of the other dimension to match the provided aspect ratio, cropping the image if needed. 
        If neither width or height is provided, height will be set based on the intrinsic width of the source image.
        `,
      },
      sizes: {
        type: `String`,
        description: stripIndent`
            The "sizes" property, passed to the img tag. This describes the display size of the image. 
            This does not affect the generated images, but is used by the browser to decide which images to download. You can leave this blank for fixed images, or if the responsive image
            container will be the full width of the screen. In these cases we will generate an appropriate value.
        `,
      },
      outputPixelDensities: {
        type: `[Float]`,
        description: stripIndent`
            A list of image pixel densities to generate for FIXED and CONSTRAINED images. You should rarely need to change this. It will never generate images larger than the source, and will always include a 1x image.
            Default is [ 1, 2 ] for fixed images, meaning 1x, 2x, 3x, and [0.25, 0.5, 1, 2] for fluid. In this case, an image with a fluid layout and width = 400 would generate images at 100, 200, 400 and 800px wide.
            Ignored for FULL_WIDTH, which uses breakpoints instead.
            `,
      },
      breakpoints: {
        type: `[Int]`,
        description: stripIndent`
        Specifies the image widths to generate. You should rarely need to change this. For FIXED and CONSTRAINED images it is better to allow these to be determined automatically,
        based on the image size. For FULL_WIDTH images this can be used to override the default, which is determined by the plugin.
        It will never generate any images larger than the source.
        `,
      },
      backgroundColor: {
        type: `String`,
        description: `Background color applied to the wrapper, or when "letterboxing" an image to another aspect ratio.`,
      },
      ...extraArgs,
    },
    resolve,
  }
}

export function getGatsbyImageFieldConfig<TSource, TContext, TArgs>(
  resolve: GraphQLFieldResolver<TSource, TContext>,
  extraArgs?: GraphQLFieldConfigArgumentMap
): GraphQLFieldConfig<TSource, TContext, TArgs>
export function getGatsbyImageFieldConfig<TSource, TContext>(
  resolve: GraphQLFieldResolver<TSource, TContext>,
  extraArgs?: GraphQLFieldConfigArgumentMap
): GraphQLFieldConfig<TSource, TContext> {
  return {
    type: new GraphQLNonNull(GraphQLJSON),
    args: {
      layout: {
        type: ImageLayoutType,
        description: stripIndent`
            The layout for the image.
            FIXED: A static image sized, that does not resize according to the screen width
            FULL_WIDTH: The image resizes to fit its container. Pass a "sizes" option if it isn't going to be the full width of the screen.
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
      aspectRatio: {
        type: GraphQLFloat,
        description: stripIndent`
        If set along with width or height, this will set the value of the other dimension to match the provided aspect ratio, cropping the image if needed. 
        If neither width or height is provided, height will be set based on the intrinsic width of the source image.
        `,
      },
      placeholder: {
        type: ImagePlaceholderType,
        description: stripIndent`
            Format of generated placeholder image, displayed while the main image loads.
            BLURRED: a blurred, low resolution image, encoded as a base64 data URI (default)
            DOMINANT_COLOR: a solid color, calculated from the dominant color of the image.
            TRACED_SVG: a low-resolution traced SVG of the image.
            NONE: no placeholder. Set the argument "backgroundColor" to use a fixed background color.`,
      },
      formats: {
        type: GraphQLList(ImageFormatType),
        description: stripIndent`
            The image formats to generate. Valid values are AUTO (meaning the same format as the source image), JPG, PNG, WEBP and AVIF.
            The default value is [AUTO, WEBP], and you should rarely need to change this. Take care if you specify JPG or PNG when you do
            not know the formats of the source images, as this could lead to unwanted results such as converting JPEGs to PNGs. Specifying
            both PNG and JPG is not supported and will be ignored. 
        `,
        defaultValue: [``, `webp`],
      },
      outputPixelDensities: {
        type: GraphQLList(GraphQLFloat),
        description: stripIndent`
            A list of image pixel densities to generate for FIXED and CONSTRAINED images. You should rarely need to change this. It will never generate images larger than the source, and will always include a 1x image.
            Default is [ 1, 2 ] for fixed images, meaning 1x, 2x, 3x, and [0.25, 0.5, 1, 2] for fluid. In this case, an image with a fluid layout and width = 400 would generate images at 100, 200, 400 and 800px wide.
            `,
      },
      breakpoints: {
        type: GraphQLList(GraphQLInt),
        description: stripIndent`
        Specifies the image widths to generate. You should rarely need to change this. For FIXED and CONSTRAINED images it is better to allow these to be determined automatically,
        based on the image size. For FULL_WIDTH images this can be used to override the default, which is [750, 1080, 1366, 1920].
        It will never generate any images larger than the source.
        `,
      },
      sizes: {
        type: GraphQLString,
        description: stripIndent`
            The "sizes" property, passed to the img tag. This describes the display size of the image.
            This does not affect the generated images, but is used by the browser to decide which images to download. You can leave this blank for fixed images, or if the responsive image
            container will be the full width of the screen. In these cases we will generate an appropriate value.
        `,
      },
      backgroundColor: {
        type: GraphQLString,
        description: `Background color applied to the wrapper, or when "letterboxing" an image to another aspect ratio.`,
      },
      ...extraArgs,
    },
    resolve,
  }
}
