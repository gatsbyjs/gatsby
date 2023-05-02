// @ts-check
import { stripIndent } from "common-tags"
import { GraphQLBoolean, GraphQLInt } from "gatsby/graphql"
import { hasFeature } from "gatsby-plugin-utils"

import { resolveGatsbyImageData } from "./gatsby-plugin-image"
import { ImageCropFocusType, ImageResizingBehavior } from "./schemes"
import { makeTypeName } from "./normalize"

export async function setFieldsOnGraphQLNodeType(
  { type, cache },
  { typePrefix = `Contentful` } = {}
) {
  if (type.name !== makeTypeName(`Asset`, typePrefix)) {
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
        },
      }
    )

    fieldConfig.type = hasFeature(`graphql-typegen`)
      ? `GatsbyImageData`
      : `JSON`

    return fieldConfig
  }

  const gatsbyImageData = await getGatsbyImageData()

  return {
    gatsbyImageData,
  }
}
