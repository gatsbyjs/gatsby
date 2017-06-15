// @flow
const sift = require(`sift`)
const _ = require(`lodash`)
const { connectionFromArray } = require(`graphql-skip-limit`)
const { store } = require(`../redux/`)
const { createPageDependency } = require(`../redux/actions/add-page-dependency`)

type Node = {
  id: String,
  type: String,
}

module.exports = ({ args, nodes, connection = false, path = `` }) => {
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
  if (clonedArgs.filter) {
    _.each(clonedArgs.filter, (v, k) => {
      // Ignore connection and sorting args
      if (_.includes([`skip`, `limit`, `sort`], k)) return

      siftArgs.push(siftifyArgs({ [k]: v }))
    })
  }

  let result = _.isEmpty(siftArgs) ? nodes : sift({ $and: siftArgs }, nodes)

  if (!result || !result.length) return

  // Sort results.
  if (clonedArgs.sort) {
    const convertedFields = clonedArgs.sort.fields.map(field =>
      field.replace(/___/g, `.`)
    )

    result = _.orderBy(result, convertedFields, clonedArgs.sort.order)
  }

  if (connection) {
    const connectionArray = connectionFromArray(result, args)
    connectionArray.totalCount = result.length
    if (result.length > 0 && result[0].internal) {
      createPageDependency({
        path,
        connection: result[0].internal.type,
      })
    }
    return connectionArray
  }

  createPageDependency({
    path,
    nodeId: result[0].id,
  })
  return result[0]
}
