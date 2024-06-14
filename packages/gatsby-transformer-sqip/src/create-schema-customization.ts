import { GatsbyNode } from "gatsby"
import {
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from "gatsby/graphql"

const SqipMetadataPaletteData = new GraphQLObjectType({
  name: `SqipMetadataPaletteData`,
  fields: {
    population: { type: GraphQLInt },
    rgb: { type: new GraphQLList(GraphQLInt) },
    hsl: { type: new GraphQLList(GraphQLFloat) },
    hex: { type: GraphQLString },
  },
})

export const SqipMetadata = new GraphQLObjectType({
  name: `SqipMetadata`,
  fields: {
    originalWidth: { type: GraphQLInt },
    originalHeight: { type: GraphQLInt },
    palette: {
      type: new GraphQLObjectType({
        name: `SqipMetadataPalette`,
        fields: {
          Vibrant: { type: SqipMetadataPaletteData },
          DarkVibrant: { type: SqipMetadataPaletteData },
          LightVibrant: { type: SqipMetadataPaletteData },
          Muted: { type: SqipMetadataPaletteData },
          DarkMuted: { type: SqipMetadataPaletteData },
          LightMuted: { type: SqipMetadataPaletteData },
        },
      }),
    },
    type: { type: GraphQLString },
    width: { type: GraphQLInt },
    height: { type: GraphQLInt },
  },
})

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] =
  ({ actions }) => {
    const { createTypes } = actions
    createTypes([SqipMetadataPaletteData, SqipMetadata])
  }
