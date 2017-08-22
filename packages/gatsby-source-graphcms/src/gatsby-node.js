import { GraphQLClient } from "graphql-request"
import R from "ramda"
import crypto from "crypto"
import { assembleQueries, extractTypeName } from "./util"

const SOURCE_NAME = `GraphCMS`

module.exports.sourceNodes = async (
  { boundActionCreators, getNode, hasNodeChanged },
  { endpoint, token }
) => {
  const { createNode } = boundActionCreators

  const clientOptions = {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  }

  const client = new GraphQLClient(endpoint, clientOptions)
  const typeData = await client.request(metaQuery)

  const fullData = await client.request(assembleQueries(typeData))

  R.forEachObjIndexed(createNodes(createNode), fullData)
}

// Query for fetching all node times from graphql endpoint.
const metaQuery = `
{
  __type(name: "Node") {
    possibleTypes {
      name
      fields {
        name
      }
      description
    }
  }
}
`

const createNodes = createNode => (value, key) => {
  R.forEach(node => {
    const { id, ...fields } = node

    const jsonNode = JSON.stringify(node)

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
