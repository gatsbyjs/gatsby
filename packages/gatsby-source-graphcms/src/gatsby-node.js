import { GraphQLClient } from "graphql-request"
import R from "ramda"
import crypto from "crypto"
import { extractTypeName } from "./util"
import {
  faultyKeywords,
  keywordsError,
  checkForFaultyFields
} from './faulty-keywords'

const SOURCE_NAME = `GraphCMS`

const DEBUG_MODE = false

exports.sourceNodes = async (
  { boundActionCreators, reporter },
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
    // keywords workaround
    if (checkForFaultyFields(userQueryResult, faultyKeywords)) {
      throw new Error(keywordsError)
    }
    if (DEBUG_MODE) {
      const jsonUserQueryResult = JSON.stringify(userQueryResult, undefined, 2)
      console.log(`\ngatsby-source-graphcms: GraphQL query results: ${jsonUserQueryResult}`)
    }
    R.forEachObjIndexed(createNodes(createNode, reporter), userQueryResult)
  } else {
    reporter.panic(`gatsby-source-graphcms: you need to provide a GraphQL query in the plugin 'query' parameter`)
  }
}

const createNodes = (createNode, reporter) => (value, key) => {
  R.forEach(queryResultNode => {
    const { id, ...fields } = queryResultNode
    const jsonNode = JSON.stringify(queryResultNode)
    const gatsbyNode = {
        id,
        ...fields,
        parent: `${SOURCE_NAME}_${key}`,
        children: [],
        internal: {
          type: extractTypeName(key),
          content: jsonNode,
          contentDigest: crypto.createHash(`md5`).update(jsonNode).digest(`hex`),
        },
      }

    if (DEBUG_MODE) {
      const jsonFields = JSON.stringify(fields)
      const jsonGatsbyNode = JSON.stringify(gatsbyNode)
      reporter.info(`  processing node: ${jsonNode}`)
      reporter.info(`    node id ${id}`)
      reporter.info(`    node fields: ${jsonFields}`)
      reporter.info(`    gatsby node: ${jsonGatsbyNode}`)
    }

    createNode(gatsbyNode)
  }, value)
}
