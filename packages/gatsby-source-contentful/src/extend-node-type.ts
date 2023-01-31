import { stripIndent } from "common-tags"
import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLJSON,
  GraphQLString,
} from "gatsby/graphql"
import { hasFeature } from "gatsby-plugin-utils"
import { GatsbyNode } from "gatsby"

import { resolveGatsbyImageData } from "./gatsby-plugin-image"
import { ImageCropFocusType, ImageResizingBehavior } from "./schemes"
import {
  IContentfulAsset,
  IContentfulImageAPITransformerOptions,
} from "./types/contentful"

// @todo DO WE STILL NEED THIS?
export const setFieldsOnGraphQLNodeType: GatsbyNode["setFieldsOnGraphQLNodeType"] =
  async function setFieldsOnGraphQLNodeType({ type, cache }) {
    if (type.name !== `ContentfulAsset`) {
      return {}
    }

    // gatsby-plugin-image
    const getGatsbyImageData = async (): Promise<any> => {
      const { getGatsbyImageFieldConfig } = await import(
        `gatsby-plugin-image/graphql-utils`
      )

      const fieldConfig = getGatsbyImageFieldConfig(
        async (
          image: IContentfulAsset,
          options: IContentfulImageAPITransformerOptions
        ) => resolveGatsbyImageData(image, options, { cache }),
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
          backgroundColor: {
            type: GraphQLString,
          },
          blurredOptions: {
            type: GraphQLJSON,
          },
          height: {
            type: GraphQLInt,
          },
          placeholder: {
            type: GraphQLString,
          },
          toFormat: {
            type: GraphQLString,
          },
          tracedSVGOptions: {
            type: GraphQLJSON,
          },
          width: {
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
