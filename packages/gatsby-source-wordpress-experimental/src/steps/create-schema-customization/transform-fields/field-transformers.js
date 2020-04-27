import { buildTypeName } from "../helpers"
import { transformUnion, transformListOfUnions } from "./transform-union"
import { transformGatsbyNodeObject } from "~/steps/create-schema-customization/transform-fields/transform-object"
import { transformListOfGatsbyNodes } from "./transform-object"
import { getGatsbyNodeTypeNames } from "~/steps/source-nodes/fetch-nodes/fetch-nodes"
import { typeIsABuiltInScalar } from "~/steps/create-schema-customization/helpers"

export const fieldTransformers = [
  {
    // non null scalars
    test: field =>
      field.type.kind === `NON_NULL` && field.type.ofType.kind === `SCALAR`,

    transform: ({ field }) => {
      if (typeIsABuiltInScalar(field.type)) {
        return `${field.type.ofType.name}!`
      } else {
        return `JSON!`
      }
    },
  },

  {
    // non null lists
    test: field =>
      field.type.kind === `NON_NULL` &&
      field.type.ofType.kind === `LIST` &&
      (field.type.ofType.name || field.type.ofType?.ofType?.name),

    transform: ({ field }) => {
      if (typeIsABuiltInScalar(field.type)) {
        return `[${field.type.ofType.name || field.type.ofType?.ofType?.name}]!`
      }

      return `[${buildTypeName(field.type.ofType.name) ??
        buildTypeName(field.type.ofType?.ofType?.name)}]!`
    },
  },

  {
    // lists of non null builtin types
    test: field =>
      field.type.kind === `LIST` &&
      field.type.ofType.kind === `NON_NULL` &&
      (field.type.ofType.name ?? field.type.ofType?.ofType?.name) &&
      typeIsABuiltInScalar(field.type),

    transform: ({ field }) =>
      `[${field.type.ofType.name ?? field.type.ofType?.ofType?.name}!]`,
  },

  {
    // lists of non null types
    test: field =>
      field.type.kind === `LIST` &&
      field.type.ofType.kind === `NON_NULL` &&
      (field.type.ofType.name ?? field.type.ofType?.ofType?.name),

    transform: ({ field }) =>
      `[${buildTypeName(field.type.ofType.name) ??
        buildTypeName(field.type.ofType?.ofType?.name)}!]`,
  },

  {
    // scalars
    test: field => field.type.kind === `SCALAR`,
    transform: ({ field }) => {
      if (typeIsABuiltInScalar(field.type)) {
        return field.type.name
      } else {
        return `JSON`
      }
    },
  },

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
    // lists of gatsby-node objects
    test: field => {
      const gatsbyNodeTypes = getGatsbyNodeTypeNames()

      return (
        field.type.kind === `LIST` &&
        field.type.ofType.kind === `OBJECT` &&
        gatsbyNodeTypes.includes(field.type.ofType.name)
      )
    },

    transform: transformListOfGatsbyNodes,
  },

  {
    // non-gatsby-node objects
    test: field => field.type.kind === `OBJECT`,
    transform: ({ field }) => buildTypeName(field.type.name),
  },

  {
    // lists of non-gatsby-node objects
    test: field =>
      field.type.kind === `LIST` && field.type.ofType.kind === `OBJECT`,

    transform: ({ field }) => `[${buildTypeName(field.type.ofType.name)}]`,
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

    transform: ({ field }) => {
      if (typeIsABuiltInScalar(field.type)) {
        return `[${field.type.ofType.name}]`
      } else {
        return `[JSON]`
      }
    },
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
