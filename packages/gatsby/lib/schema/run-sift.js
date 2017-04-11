// @flow
const sift = require("sift")
const _ = require("lodash")
const {
  connectionFromArray,
} = require("graphql-skip-limit")
const { store } = require("../redux/")
const { boundActionCreators } = require("../redux/actions")
const { addPageDependency } = boundActionCreators

type Node = {
  id: String,
  type: String,
};

module.exports = ({ args, nodes, connection = false, path = "" }) => {
  // Clone args as for some reason graphql-js removes the constructor
  // from nested objects which breaks a check in sift.js.
  const clonedArgs = JSON.parse(JSON.stringify(args))

  const siftifyArgs = object => {
    const newObject = {}
    _.each(object, (v, k) => {
      if (_.isObject(v) && !_.isArray(v)) {
        newObject[k] = siftifyArgs(v)
      } else {
        // Compile regex first.
        if (k === `regex`) {
          const exploded = v.split(`/`)
          const regex = new RegExp(exploded[1], exploded[2])
          newObject[`$regex`] = regex
        } else if (k === `glob`) {
          const Minimatch = require(`minimatch`).Minimatch
          const mm = new Minimatch(v)
          newObject[`$regex`] = mm.makeRe()
        } else {
          newObject[`$${k}`] = v
        }
      }
    })
    return newObject
  }
  const siftArgs = []
  _.each(clonedArgs, (v, k) => {
    // Ignore connection and sorting args
    if (_.includes([`skip`, `limit`, `sortBy`], k)) {
      return
    }
    const tempObject = {}
    tempObject[k] = v
    siftArgs.push(siftifyArgs(tempObject))
  })

  let result = []
  if (_.isEmpty(siftArgs)) {
    result = nodes
  } else {
    result = sift({ $and: siftArgs }, nodes)
    if (!result) {
      result = []
    }
  }

  // Sort results.
  if (clonedArgs.sortBy) {
    const convertedFields = clonedArgs.sortBy.fields.map(field =>
      field.replace(`___`, `.`))
    result = _.orderBy(result, convertedFields, clonedArgs.sortBy.order)
  }

  if (connection) {
    const connectionArray = connectionFromArray(result, args)
    connectionArray.totalCount = result.length
    addPageDependency({
      path,
      connection: result[0].type,
    })
    return connectionArray
  } else {
    addPageDependency({
      path,
      nodeId: result[0].id,
    })
    return result[0]
  }
}
