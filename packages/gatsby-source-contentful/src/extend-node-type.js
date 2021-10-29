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
