/* @flow weak */
import _ from "lodash"
import path from "path"
import Promise from "bluebird"
import { GraphQLSchema, GraphQLObjectType } from "graphql"

import { siteDB } from "../utils/globals"
import markdownSchema from "./markdown"
import siteSchema from "./site-schema"
import apiRunnerNode from "../utils/api-runner-node"
//import imagesSchema from './images-schema'
//import pdfSchema from './pdf'

module.exports = async () => {
  const config = siteDB().get(`config`)

  return new Promise((resolve, reject) => {
    Promise.all([
      markdownSchema(path.resolve(config.sources)),
      siteSchema(),
      //imagesSchema(path.resolve(config.sources)),
      //pdfSchema(path.resolve(config.sources)),
    ])
      .catch(error => {
        console.log(`error in booting schema`, error)
        reject(error)
      })
      .then(types => {
        const mergedTypes = _.merge(...types)
        apiRunnerNode(
          `modifyGraphQLFields`,
          { types: mergedTypes },
          mergedTypes
        ).then(modifiedTypes => {
          const schema = new GraphQLSchema({
            query: new GraphQLObjectType({
              name: `RootQueryType`,
              fields: () => ({
                ...modifiedTypes,
              }),
            }),
          })
          resolve(schema)
        })
      })
  })
}
