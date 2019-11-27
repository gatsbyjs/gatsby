import gql from "../../utils/gql"
import fetchGraphql from "../../utils/fetch-graphql"
import { dd } from "dumper.js"

export default async (helpers, pluginOptions) => {
  const introspection = await fetchGraphql({
    url: pluginOptions.url,
    query: gql`
      query {
        __schema {
          types {
            kind
            name
            fields {
              name
              description
              type {
                ofType {
                  kind
                  name
                }
                kind
                name
                description
              }
            }
          }

          mutationType {
            fields {
              type {
                name
              }
            }
          }
        }
      }
    `,
  })
  let typeDefs = []

  const mutationTypes = introspection.data.__schema.mutationType.fields.map(
    field => field.type.name
  )

  // for now just pull object types, we'll need other types soon though
  introspection.data.__schema.types
    .filter(
      type =>
        type.name !== `RootQuery` &&
        type.kind === `OBJECT` &&
        // don't create mutation or connection types! we don't need them
        !mutationTypes.includes(type.name) &&
        !type.name.includes(`Connection`)
    )
    .forEach(type => {
      // create type definition
      typeDefs.push(
        helpers.schema.buildObjectType({
          name: `Wp${type.name}`,
          interfaces: [`Node`],
          fields: type.fields.reduce((acc, { name, ...curr }) => {
            // skip mutations
            if (mutationTypes.includes(curr.type.name)) {
              return acc
            }

            // skip connection types?
            if (
              curr.type &&
              curr.type.name &&
              curr.type.name.includes(`Connection`)
            ) {
              return acc
            }

            // non null scalar types
            if (
              curr.type.kind === `NON_NULL` &&
              curr.type.ofType.kind === `SCALAR`
            ) {
              acc[name] = `${curr.type.ofType.name}!`
            }

            // scalar types
            if (curr.type.kind === `SCALAR`) {
              acc[name] = curr.type.name
            }

            // object types should be top level Gatsby nodes
            // so we link them by id
            if (curr.type.kind === `OBJECT`) {
              acc[name] = {
                type: `Wp${curr.type.name}`,
                resolve: (source, args, context, info) => {
                  if (!source[name] || (source[name] && !source[name].id)) {
                    return null
                  }

                  return context.nodeModel.getNodeById({
                    id: source[name].id,
                    type: `Wp${curr.type.name}`,
                  })
                },
              }
            }

            // handle lists & unions here

            return acc
          }, {}),
          extensions: {
            infer: false,
          },
        })
      )

      // create gql query string
    })

  helpers.actions.createTypes(typeDefs)
}
