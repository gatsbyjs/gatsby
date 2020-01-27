import { buildTypeName } from "../helpers"
import { transformUnion, transformListOfUnions } from "./transform-union"
import { transformGatsbyNodeObject } from "~/steps/create-schema-customization/transform-fields/transform-object"
import { transformListOfObjects } from "./transform-object"
import { getGatsbyNodeTypeNames } from "~/steps/source-nodes/fetch-nodes/fetch-nodes"

export const transformMap = [
  {
    // Gatsby node Objects
    test: field => {
      const gatsbyNodeTypes = getGatsbyNodeTypeNames()

      return (
        gatsbyNodeTypes.includes(field.type.name) &&
        field.type.kind === `OBJECT`
      )
    },

    transform: transformGatsbyNodeObject,
  },

  {
    // non null scalars
    test: field =>
      field.type.kind === `NON_NULL` && field.type.ofType.kind === `SCALAR`,

    transform: ({ field }) => `${field.type.ofType.name}!`,
  },

  {
    // non null lists
    test: field =>
      field.type.kind === `NON_NULL` &&
      field.type.ofType.kind === `LIST` &&
      field.type.ofType.name,

    transform: ({ field }) => `[${field.type.ofType.name}]!`,
  },

  {
    // scalars
    test: field => field.type.kind === `SCALAR`,

    transform: ({ field }) => field.type.name,
  },

  {
    // non-gatsby-node objects
    test: field => field.type.kind === `OBJECT`,

    transform: ({ field }) => buildTypeName(field.type.name),
  },

  {
    // lists of objects
    test: field =>
      field.type.kind === `LIST` && field.type.ofType.kind === `OBJECT`,

    transform: transformListOfObjects,
  },

  {
    // lists of unions
    test: field =>
      field.type.kind === `LIST` && field.type.ofType.kind === `UNION`,

    transform: transformListOfUnions,
  },

  {
    // list of scalars
    test: field =>
      field.type.kind === `LIST` && field.type.ofType.kind === `SCALAR`,

    transform: ({ field }) => `[${field.type.ofType.name}]`,
  },

  {
    // lists of interfaces
    test: field =>
      field.type.kind === `LIST` && field.type.ofType.kind === `INTERFACE`,

    transform: ({ field }) => `[${buildTypeName(field.type.ofType.name)}]`,
  },

  {
    // unions
    test: field => field.type.kind === `UNION`,

    transform: transformUnion,
  },

  {
    // interfaces
    test: field => field.type.kind === `INTERFACE`,

    transform: ({ field }) => buildTypeName(field.type.name),
  },
]
