import Promise from 'bluebird'
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql'
import moment from 'moment'
import _ from 'lodash'

import pagesSchema from './pages-schema'
import inferGraphQLType from './infer-graphql-type'
import { siteDB } from '../utils/globals'

module.exports = () => {
  return new Promise((resolve) => {
    const config = siteDB().get(`config`)
    // Create site/page types.
    const metadataFields = () => {
      const fields = { empty: { type: GraphQLBoolean } }
      // TODO make this work with sub-objects.
      if (config.siteMetadata) {
        _.each(config.siteMetadata, (v, k) => {
          const type = inferGraphQLType(k, v)
          if (type === `DATE`) {
            fields[k] = {
              type: GraphQLString,
              args: {
                formatString: {
                  type: GraphQLString,
                },
              },
              resolve (date, { formatString }) {
                if (formatString) {
                  return moment(date).format(formatString)
                } else {
                  return date
                }
              },
            }
          } else {
            fields[k] = { type: inferGraphQLType(k, v) }
          }
        })
      }

      if (Object.keys(fields).length > 2) {
        delete fields.empty
      }

      return fields
    }

    pagesSchema()
    .then((pagesTypes) => {
      const siteType = new GraphQLObjectType({
        name: `Site`,
        fields: {
          siteMetadata: {
            type: new GraphQLObjectType({
              name: `SiteMetadata`,
              fields: metadataFields(),
            }),
          },
          development: {
            type: new GraphQLObjectType({
              name: `DevelopmentConfig`,
              fields: {
                port: { type: GraphQLString },
              },
            }),
          },
          linkPrefix: {
            type: GraphQLString,
            name: `prefixLink`,
            description: `Optionally prefix site links with this`,
          },
          buildTime: {
            type: GraphQLString,
            name: `buildTime`,
            description: `The time at which you ran the gatsby command).`,
            resolve: () => new Date().toJSON(),
          },
          ...pagesTypes,
        },
      })

      return resolve({
        site: {
          type: siteType,
          resolve () {
            return siteDB().get(`config`)
          },
        },
      })
    })
  })
}
