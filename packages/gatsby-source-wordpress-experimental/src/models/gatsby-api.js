import merge from "lodash/merge"

const gatsbyApi = {
  state: {
    helpers: {},
    pluginOptions: {
      url: null,
      verbose: false,
      debug: {
        graphql: {
          showQueryOnError: false,
          showQueryVarsOnError: false,
          copyQueryOnError: false,
          panicOnError: false,
        },
      },
      schema: {
        queryDepth: 10,
        typePrefix: `Wp`,
      },
      type: {
        MediaItem: {
          onlyFetchIfReferenced: false,
        },
        ContentNode: {
          nodeInterface: true,
        },
        MenuItem: {
          nodeListQueries: ({
            name,
            store,
            transformedFields,
            helpers: { buildNodesQueryOnFieldName },
          }) => {
            const menuLocationEnumValues = store
              .getState()
              .remoteSchema.introspectionData.__schema.types.find(
                type => type.name === `MenuLocationEnum`
              )
              .enumValues.map(value => value.name)

            const queries = menuLocationEnumValues.map(enumValue =>
              buildNodesQueryOnFieldName({
                fields: transformedFields,
                fieldName: name,
                fieldVariables: `where: { location: ${enumValue} }`,
              })
            )

            return queries
          },
        },
      },
    },
  },

  reducers: {
    setState(state, payload) {
      return merge(state, payload)
    },
  },
}

export default gatsbyApi
