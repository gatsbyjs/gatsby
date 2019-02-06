const systemPath = require(`path`)
const normalize = require(`normalize-path`)
const _ = require(`lodash`)
const { findRootNodeAncestor } = require(`../db/node-tracking`)
const {
  GraphQLList,
  getNullableType,
  getNamedType,
  isAbstractType,
} = require(`graphql`)
const createPageDependency = require(`../redux/actions/add-page-dependency`)

const withPageDependencies = resolve => type => async rp => {
  const result = await resolve(type)(rp)
  const { path } = rp.context || {}
  if (!path || result == null) return result

  if (Array.isArray(result)) {
    const isConnection =
      rp.info.parentType && rp.info.parentType.name === `Query`
    if (isConnection) {
      createPageDependency({ path, connection: type })
    } else {
      result
        .filter(node => node != null)
        .map(node => createPageDependency({ path, nodeId: node.id }))
    }
  } else {
    createPageDependency({ path, nodeId: result.id })
  }

  return result
}

const findById = typeName => ({ args, context }) => {
  const result = context.nodeModel.getNode(args.id)
  if (typeName && result && result.internal.type === typeName) {
    return result
  } else if (!typeName && result != null) {
    return result
  } else {
    return null
  }
}

const findByIds = typeName => ({ args, context }) => {
  if (Array.isArray(args.ids)) {
    return args.ids.map(context.nodeModel.getNode).filter(node => {
      if (typeName && node && node.internal.type === typeName) {
        return true
      } else {
        return node != null
      }
    })
  } else {
    return []
  }
}

const findMany = typeName => async ({ args, context, info }) =>
  context.nodeModel.runQuery({
    queryArgs: args,
    firstOnly: false,
    gqlType: info.schema.getType(typeName),
  })

const findOne = typeName => async ({ args, context, info }) => {
  const result = await context.nodeModel.runQuery({
    queryArgs: { filter: args },
    firstOnly: true,
    gqlType: info.schema.getType(typeName),
  })
  if (result.length > 0) {
    return result[0]
  } else {
    return null
  }
}

const findManyPaginated = typeName => async rp => {
  const result = await withPageDependencies(findMany)(typeName)(rp)
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

  // const pageCount = limit
  //   ? Math.ceil(skip / limit) + Math.ceil((count - skip) / limit)
  //   : skip
  //   ? 2
  //   : 1
  // const currentPage = limit ? Math.ceil(skip / limit) + 1 : skip ? 2 : 1 // Math.min(currentPage, pageCount)
  // // const hasPreviousPage = currentPage > 1
  const hasNextPage = skip + limit < count // currentPage < pageCount

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
      // currentPage,
      // hasPreviousPage,
      // itemCount: count,
      // pageCount,
      // perPage: limit,
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

// FIXME: Handle array of arrays
// Maybe TODO: should we check fieldValue *and* info.returnType?
const link = ({ by, from }) => async (source, args, context, info) => {
  const fieldValue = source && source[from || info.fieldName]

  if (fieldValue == null || _.isObject(fieldValue)) return fieldValue
  if (
    Array.isArray(fieldValue) &&
    // TODO: Do we have to look with fieldValue.some(v => isObject(v))?
    (fieldValue[0] == null || _.isObject(fieldValue[0]))
  ) {
    return fieldValue
  }

  if (by === `id`) {
    const [resolve, key] = Array.isArray(fieldValue)
      ? [withPageDependencies(findByIds), `ids`]
      : [withPageDependencies(findById), `id`]
    return resolve()({
      source,
      args: { [key]: fieldValue },
      context,
      info,
    })
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

  const returnType = getNullableType(info.returnType)
  const type = getNamedType(returnType)
  const possibleTypes = isAbstractType(type)
    ? info.schema.getPossibleTypes(type)
    : [type]

  if (returnType instanceof GraphQLList) {
    const results = await Promise.all(
      possibleTypes.map(type =>
        findMany(type.name)({
          source,
          args,
          context,
          info,
        })
      )
    )
    return results.reduce((acc, r) => acc.concat(r))
  } else {
    let result
    for (const type of possibleTypes) {
      result = await context.nodeModel.runQuery({
        queryArgs: args,
        firstOnly: true,
        gqlType: type,
      })
      if (result && result.length > 0) {
        return result[0]
      }
    }
    return null
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
  findById: withPageDependencies(findById),
  findByIds: withPageDependencies(findByIds),
  findByIdAndType: withPageDependencies(findById),
  findByIdsAndType: withPageDependencies(findByIds),
  findMany: withPageDependencies(findMany),
  findManyPaginated: findManyPaginated,
  findOne: withPageDependencies(findOne),
  fileByPath: fileByPath,
  link,
  distinct,
  group,
}
