"use strict"

const graphql = require(`graphql`)
const GraphQLJSON = require(`graphql-type-json`)

module.exports = Object.assign({}, graphql, { GraphQLJSON })
