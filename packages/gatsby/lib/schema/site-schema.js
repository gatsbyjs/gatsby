import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql'
import moment from 'moment'
import _ from 'lodash'

//import pagesSchema from './pages-schema'
const { inferGraphQLType } = require(`./infer-graphql-type`)
const { siteDB } = require(`../utils/globals`)
console.log(require(`./infer-graphql-type`))

module.exports = () => {
  const config = siteDB().get(`config`)
  // Create site/page types.
  const metadataFields = () => {
    const fields = { empty: { type: GraphQLBoolean } }
    if (config.siteMetadata) {
      _.each(config.siteMetadata, (v, k) => {
        fields[k] = inferGraphQLType(v)
      })
    }

    if (Object.keys(fields).length > 2) {
      delete fields.empty
    }

    return fields
  }

  let startTime
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
        resolve: () => {
          if (!startTime) {
            startTime = moment().subtract(process.uptime(), `seconds`).toJSON()
            return startTime
          } else {
            return startTime
          }
        },
      },
    },
  })

  return {
    site: {
      type: siteType,
      resolve () {
        return siteDB().get(`config`)
      },
    },
  }
}
