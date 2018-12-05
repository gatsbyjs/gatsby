"use strict"

const graphql = require(`graphql`)
const { GraphQLDate, GraphQLJSON } = require(`graphql-compose`)

module.exports = Object.assign({}, graphql, { GraphQLDate, GraphQLJSON })
