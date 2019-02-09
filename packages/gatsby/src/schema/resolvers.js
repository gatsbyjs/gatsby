const systemPath = require(`path`)
const normalize = require(`normalize-path`)
const _ = require(`lodash`)
const { findRootNodeAncestor } = require(`../db/node-tracking`)
const { GraphQLList, getNullableType, getNamedType } = require(`graphql`)

const findMany = typeName => ({ args, context, info }) =>
  context.nodeModel.runQuery(
    {
      queryArgs: args,
      firstOnly: false,
      gqlType: info.schema.getType(typeName),
    },
    { path: context.path, connection: typeName }
  )

const findOne = typeName => ({ args, context, info }) =>
  context.nodeModel.runQuery(
    {
      queryArgs: { filter: args },
      firstOnly: true,
      gqlType: info.schema.getType(typeName),
    },
    { path: context.path }
  )

const findManyPaginated = typeName => async rp => {
  const result = await findMany(typeName)(rp)
  return paginate(result, { skip: rp.args.skip, limit: rp.args.limit })
}

const distinct = (source, args, context, info) => {
  const { field } = args
  const { edges } = source
  const values = edges.reduce((acc, { node }) => {
    const value = getValueAtSelector(node, field)
    return value != null ? acc.concat(value) : acc
  }, [])
  return Array.from(new Set(values)).sort()
}

const group = (source, args, context, info) => {
  const { field } = args
  const { edges } = source
  const groupedResults = edges.reduce((acc, { node }) => {
    const value = getValueAtSelector(node, field)
    const values = Array.isArray(value) ? value : [value]
    values
      .filter(value => value != null)
      .forEach(v => (acc[v] = (acc[v] || []).concat(node)))
    return acc
  }, {})
  return Object.keys(groupedResults)
    .sort()
    .reduce((acc, fieldValue) => {
      acc.push({
        ...paginate(groupedResults[fieldValue], args),
        field,
        fieldValue,
      })
      return acc
    }, [])
}

const paginate = (results, { skip = 0, limit }) => {
  const count = results.length
  const items = results.slice(skip, limit && skip + limit)

  const hasNextPage = skip + limit < count

  return {
    totalCount: items.length,
    edges: items.map((item, i, arr) => {
      return {
        node: item,
        next: arr[i + 1],
        previous: arr[i - 1],
      }
    }),
    pageInfo: {
      hasNextPage,
    },
  }
}

const getValueAtSelector = (obj, selector) => {
  const selectors = Array.isArray(selector) ? selector : selector.split(`.`)
  return selectors.reduce((acc, key) => {
    if (acc && typeof acc === `object`) {
      if (Array.isArray(acc)) {
        return acc.map(a => a[key]).filter(a => a !== undefined)
      }
      return acc[key]
    }
    return undefined
  }, obj)
}

const link = ({ by, from }) => async (source, args, context, info) => {
  const fieldValue = source && source[from || info.fieldName]

  if (fieldValue == null || _.isPlainObject(fieldValue)) return fieldValue
  if (
    Array.isArray(fieldValue) &&
    (fieldValue[0] == null || _.isPlainObject(fieldValue[0]))
  ) {
    return fieldValue
  }

  const returnType = getNullableType(info.returnType)
  const type = getNamedType(returnType)

  if (by === `id`) {
    if (Array.isArray(fieldValue)) {
      const result = await Promise.all(
        fieldValue.map(id =>
          context.nodeModel.getNodeByType(
            { id, type: type.name },
            { path: context.path }
          )
        )
      )
      return result.filter(Boolean)
    } else {
      return context.nodeModel.getNodeByType(
        { id: fieldValue, type: type.name },
        { path: context.path }
      )
    }
  }

  const equals = value => {
    return { eq: value }
  }
  const oneOf = value => {
    return { in: value }
  }
  const operator = Array.isArray(fieldValue) ? oneOf : equals
  args.filter = by.split(`.`).reduceRight((acc, key, i, { length }) => {
    return {
      [key]: i === length - 1 ? operator(acc) : acc,
    }
  }, fieldValue)

  if (returnType instanceof GraphQLList) {
    return context.nodeModel.runQuery(
      {
        queryArgs: args,
        firstOnly: false,
        gqlType: type,
      },
      { path: context.path }
    )
  } else {
    return context.nodeModel.runQuery(
      {
        queryArgs: { filter: args },
        firstOnly: true,
        gqlType: type,
      },
      { path: context.path }
    )
  }
}

const fileByPath = (source, args, context, info) => {
  let fieldValue = source[info.fieldName]

  const isArray = getNullableType(info.returnType) instanceof GraphQLList

  if (!fieldValue) {
    return null
  }

  const findLinkedFileNode = relativePath => {
    // Use the parent File node to create the absolute path to
    // the linked file.
    const fileLinkPath = normalize(
      systemPath.resolve(parentFileNode.dir, relativePath)
    )

    // Use that path to find the linked File node.
    const linkedFileNode = _.find(
      context.nodeModel.getNodesByType(`File`),
      n => n.absolutePath === fileLinkPath
    )
    return linkedFileNode
  }

  // Find the File node for this node (we assume the node is something
  // like markdown which would be a child node of a File node).
  const parentFileNode = findRootNodeAncestor(source)

  // Find the linked File node(s)
  if (isArray) {
    return fieldValue.map(findLinkedFileNode)
  } else {
    return findLinkedFileNode(fieldValue)
  }
}

module.exports = {
  findManyPaginated,
  findOne,
  fileByPath,
  link,
  distinct,
  group,
}
