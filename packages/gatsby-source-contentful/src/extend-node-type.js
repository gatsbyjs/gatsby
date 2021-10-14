// @ts-check
import { stripIndent } from "common-tags"
import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLJSON,
  GraphQLList,
} from "gatsby/graphql"

import { resolveGatsbyImageData } from "./gatsby-plugin-image"
import {
  ImageCropFocusType,
  ImageFormatType,
  ImageLayoutType,
  ImagePlaceholderType,
  ImageResizingBehavior,
} from "./schemes"

export async function setFieldsOnGraphQLNodeType({ type, cache }) {
  if (type.name !== `ContentfulAsset`) {
    return {}
  }

  // gatsby-plugin-image
  const getGatsbyImageData = async () => {
    const { getGatsbyImageFieldConfig } = await import(
      `gatsby-plugin-image/graphql-utils`
    )

    const fieldConfig = getGatsbyImageFieldConfig(
      async (...args) => resolveGatsbyImageData(...args, { cache }),
      {
        jpegProgressive: {
          type: GraphQLBoolean,
          defaultValue: true,
        },
        resizingBehavior: {
          type: ImageResizingBehavior,
        },
        cropFocus: {
          type: ImageCropFocusType,
        },
        cornerRadius: {
          type: GraphQLInt,
          defaultValue: 0,
          description: stripIndent`
         Desired corner radius in pixels. Results in an image with rounded corners.
         Pass \`-1\` for a full circle/ellipse.`,
        },
        quality: {
          type: GraphQLInt,
          defaultValue: 50,
        },
        layout: {
          type: ImageLayoutType,
          description: stripIndent`
            The layout for the image.
            CONSTRAINED: Resizes to fit its container, up to a maximum width, at which point it will remain fixed in size.
            FIXED: A static image size, that does not resize according to the screen width
            FULL_WIDTH: The image resizes to fit its container, even if that is larger than the source image.
            Pass a value to "sizes" if the container is not the full width of the screen.
        `,
          defaultValue: `constrained`,
        },
        placeholder: {
          type: ImagePlaceholderType,
          description: stripIndent`
            Format of generated placeholder image, displayed while the main image loads.
            BLURRED: a blurred, low resolution image, encoded as a base64 data URI (default)
            DOMINANT_COLOR: a solid color, calculated from the dominant color of the image.
            TRACED_SVG: a low-resolution traced SVG of the image.
            NONE: no placeholder. Set the argument "backgroundColor" to use a fixed background color.`,
          defaultValue: `dominantColor`,
        },
        formats: {
          type: GraphQLList(ImageFormatType),
          description: stripIndent`
            The image formats to generate. Valid values are AUTO (meaning the same format as the source image), JPG, PNG, and WEBP.
            The default value is [AUTO, WEBP], and you should rarely need to change this. Take care if you specify JPG or PNG when you do
            not know the formats of the source images, as this could lead to unwanted results such as converting JPEGs to PNGs. Specifying
            both PNG and JPG is not supported and will be ignored.
        `,
          defaultValue: [``, `webp`],
        },
      }
    )

    fieldConfig.type = GraphQLJSON

    return fieldConfig
  }

  const gatsbyImageData = await getGatsbyImageData()

  return {
    gatsbyImageData,
  }
}
