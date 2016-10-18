import _ from 'lodash'
import path from 'path'
import Promise from 'bluebird'
import {
  GraphQLSchema,
  GraphQLObjectType,
} from 'graphql'

import { siteDB } from '../utils/globals'
import markdownSchema from './markdown'
import siteSchema from './site-schema'

const main = () => {
  const config = siteDB().get(`config`)

  return new Promise((resolve, reject) => {
    Promise.all([
      markdownSchema(path.resolve(config.sources)),
      siteSchema(),
    ])
    .catch((error) => {
      console.log(`error in booting schema`, error)
      reject(error)
    })
    .then((types) => {
      console.log(`types`, types)

      const mergedTypes = _.merge(...types)
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          name: `RootQueryType`,
          fields: {
            ...mergedTypes,
          },
        }),
      })

      resolve(schema)
    })
  })
}

module.exports = main
