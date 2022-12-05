export const typeDefinitionFilters = [
  {
    typeName: `__all`,
    typeDef: typeDef => {
      /**
       * @todo once WPGraphQL has a DateTime Scalar, use that to find date fields
       * instead of the below fieldnames
       */

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
