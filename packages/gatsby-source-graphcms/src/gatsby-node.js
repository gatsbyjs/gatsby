import { GraphQLClient } from "graphql-request"
import R from "ramda"
import crypto from "crypto"
import { assembleQueries, extractTypeName } from "./util"

const SOURCE_NAME = `GraphCMS`

module.exports.sourceNodes = async (
  { boundActionCreators, getNode, hasNodeChanged },
  { endpoint, token, query }
) => {
  const { createNode } = boundActionCreators

  const clientOptions = {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  }

  const client = new GraphQLClient(endpoint, clientOptions)

  if (query) {
    const userQueryResult = await client.request(query)
    console.log(userQueryResult)
    R.forEachObjIndexed(createNodes(createNode), userQueryResult)
  }

  // TODO: Use introspection to construct a query to fetch all data and add them as nodes.
  // const typeData = await client.request(metaQuery)
  //
  // const {
  //   __type: {
  //     possibleTypes
  //   },
  // } = typeData
  //
  // R.map(type => {
  //   console.log('type ', type.name, 'has fields: \n', type.fields);
  // })(possibleTypes)

  // const fullData = await client.request(assembleQueries(typeData))
}

const findEmbeddedFields = R.map(field => {
  console.log(`field: `, field.name, `is type: `, field.type.name)
  //is a node

  const embeddedField = R.find(R.propEq(`name`, field.type.name))(possibleTypes)
  console.log(`embedded field is `, embeddedField)
})

// Query for fetching all node times from graphql endpoint.
const metaQuery = `
query getTypeFields {
  __type(name: "Node") {
    possibleTypes {
      name
      fields {
        name
        type {
          name
        }
      }
    }
  }
}
`

const createNodes = createNode => (value, key) => {
  R.forEach(node => {
    const { id, ...fields } = node

    const jsonNode = JSON.stringify(node)

    console.log(`Making node with id `, id, ` and fields: `, fields)

    createNode({
      id,
      ...fields,
      parent: `${SOURCE_NAME}_${key}`,
      children: [],
      internal: {
        type: extractTypeName(key),
        content: jsonNode,
        contentDigest: crypto.createHash(`md5`).update(jsonNode).digest(`hex`),
      },
    })
  }, value)
}
