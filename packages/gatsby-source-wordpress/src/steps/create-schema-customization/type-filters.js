import { buildInterfacesListForType } from "./helpers"

export const typeDefinitionFilters = [
  {
    typeName: `__all`,
    typeDef: (typeDef, { type }) => {
      if (type.interfaces && typeDef) {
        typeDef.interfaces ||= []
        typeDef.interfaces.push(...buildInterfacesListForType(type))
      }

      if (typeDef?.interfaces?.includes(`Node`)) {
        // used to filter by different node types within a node interface
        typeDef.fields.nodeType = `String`
      }

      if (typeDef?.fields?.date) {
        const dateField = {
          ...typeDef.fields.date,
          type: `Date`,
          extensions: {
            dateformat: {},
          },
        }

        typeDef.fields.date = dateField
      }

      if (typeDef?.fields?.dateGmt) {
        const dateField = {
          ...typeDef.fields.dateGmt,
          type: `Date`,
          extensions: {
            dateformat: {},
          },
        }

        typeDef.fields.dateGmt = dateField
      }

      if (typeDef?.fields?.modified) {
        const dateField = {
          ...typeDef.fields.modified,
          type: `Date`,
          extensions: {
            dateformat: {},
          },
        }

        typeDef.fields.modified = dateField
      }

      if (typeDef?.fields?.modifiedGmt) {
        const dateField = {
          ...typeDef.fields.modifiedGmt,
          type: `Date`,
          extensions: {
            dateformat: {},
          },
        }

        typeDef.fields.modifiedGmt = dateField
      }

      return typeDef
    },
  },
  {
    typeName: `MediaItem`,
    typeDef: objectType => {
      objectType.fields.localFile = {
        type: `File`,
        extensions: {
          link: { from: `localFile.id` },
        },
      }

      return objectType
    },
  },
]
