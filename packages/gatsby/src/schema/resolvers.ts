import systemPath from "path"
import normalize from "normalize-path"
import {
  GraphQLList,
  GraphQLType,
  getNullableType,
  getNamedType,
  Kind,
  GraphQLFieldConfig,
  GraphQLResolveInfo,
  isObjectType,
  isInterfaceType,
  isEnumType,
  isInputObjectType,
  SelectionSetNode,
  SelectionNode,
  FieldNode,
} from "graphql"
import { Path } from "graphql/jsutils/Path"
import reporter from "gatsby-cli/lib/reporter"
import { pathToArray } from "../query/utils"
import { getValueAt } from "../utils/get-value-at"
import {
  GatsbyResolver,
  IGatsbyConnection,
  IGatsbyResolverContext,
} from "./type-definitions"
import { IGatsbyNode } from "../redux/types"
import { IQueryResult } from "../datastore/types"
import { GatsbyIterable } from "../datastore/common/iterable"
import {
  getResolvedFields,
  fieldPathNeedToResolve,
  INestedPathStructureNode,
  pathObjectToPathString,
} from "./utils"

type ResolvedLink = IGatsbyNode | Array<IGatsbyNode> | null

type nestedListOfStrings = Array<string | nestedListOfStrings>
type nestedListOfNodes = Array<IGatsbyNode | nestedListOfNodes>

export function getMaybeResolvedValue(
  node: IGatsbyNode,
  field: string | INestedPathStructureNode,
  nodeInterfaceName: string
): any {
  if (typeof field !== `string`) {
    field = pathObjectToPathString(field).path
  }

  if (
    fieldPathNeedToResolve({
      selector: field,
      type: nodeInterfaceName,
    })
  ) {
    return getValueAt(getResolvedFields(node) as Record<string, unknown>, field)
  } else {
    return getValueAt(node, field)
  }
}

export function findOne<TSource, TArgs>(
  typeName: string
): GatsbyResolver<TSource, TArgs> {
  return function findOneResolver(_source, args, context, info): any {
    if (context.stats) {
      context.stats.totalRunQuery++
    }
    return context.nodeModel.findOne(
      {
        query: { filter: args },
        type: info.schema.getType(typeName),
        stats: context.stats,
        tracer: context.tracer,
      },
      { path: context.path }
    )
  }
}

type PaginatedArgs<TArgs> = TArgs & { skip?: number; limit?: number; sort: any }

export function findManyPaginated<TSource, TArgs>(
  typeName: string
): GatsbyResolver<TSource, PaginatedArgs<TArgs>> {
  return async function findManyPaginatedResolver(
    _source,
    args,
    context,
    info
  ): Promise<IGatsbyConnection<IGatsbyNode>> {
    // Peek into selection set and pass on the `field` arg of `group` and
    // `distinct` which might need to be resolved.
    const group = getProjectedField(info, `group`)
    const distinct = getProjectedField(info, `distinct`)
    const max = getProjectedField(info, `max`)
    const min = getProjectedField(info, `min`)
    const sum = getProjectedField(info, `sum`)

    // Apply paddings for pagination
    // (for previous/next node and also to detect if there is a previous/next page)
    const skip = typeof args.skip === `number` ? Math.max(0, args.skip - 1) : 0
    const limit = typeof args.limit === `number` ? args.limit + 2 : undefined

    const extendedArgs = {
      ...args,
      group: group || [],
      distinct: distinct || [],
      max: max || [],
      min: min || [],
      sum: sum || [],
      skip,
      limit,
    }
    // Note: stats are passed to telemetry in src/commands/build.ts
    if (context.stats) {
      context.stats.totalRunQuery++
      context.stats.totalPluralRunQuery++
    }
    const result = await context.nodeModel.findAll(
      {
        query: extendedArgs,
        type: info.schema.getType(typeName),
        stats: context.stats,
        tracer: context.tracer,
      },
      { path: context.path, connectionType: typeName }
    )
    return paginate(result, {
      resultOffset: skip,
      skip: args.skip,
      limit: args.limit,
    })
  }
}

interface IFieldConnectionArgs {
  field: string | INestedPathStructureNode
}

export function createDistinctResolver(
  nodeInterfaceName: string
): GatsbyResolver<IGatsbyConnection<IGatsbyNode>, IFieldConnectionArgs> {
  return function distinctResolver(source, args): Array<string> {
    const { field } = args
    const { edges } = source

    const values = new Set<string>()
    edges.forEach(({ node }) => {
      const value = getMaybeResolvedValue(node, field, nodeInterfaceName)
      if (value === null || value === undefined) {
        return
      }
      if (Array.isArray(value)) {
        value.forEach(subValue =>
          values.add(
            subValue instanceof Date ? subValue.toISOString() : subValue
          )
        )
      } else if (value instanceof Date) {
        values.add(value.toISOString())
      } else {
        values.add(value)
      }
    })
    return Array.from(values).sort()
  }
}

export function createMinResolver(
  nodeInterfaceName: string
): GatsbyResolver<IGatsbyConnection<IGatsbyNode>, IFieldConnectionArgs> {
  return function minResolver(source, args): number | null {
    const { field } = args
    const { edges } = source

    let min = Number.MAX_SAFE_INTEGER

    edges.forEach(({ node }) => {
      let value = getMaybeResolvedValue(node, field, nodeInterfaceName)

      if (typeof value !== `number`) {
        value = Number(value)
      }
      if (!isNaN(value) && value < min) {
        min = value
      }
    })
    if (min === Number.MAX_SAFE_INTEGER) {
      return null
    }
    return min
  }
}

export function createMaxResolver(
  nodeInterfaceName: string
): GatsbyResolver<IGatsbyConnection<IGatsbyNode>, IFieldConnectionArgs> {
  return function maxResolver(source, args): number | null {
    const { field } = args
    const { edges } = source

    let max = Number.MIN_SAFE_INTEGER

    edges.forEach(({ node }) => {
      let value = getMaybeResolvedValue(node, field, nodeInterfaceName)
      if (typeof value !== `number`) {
        value = Number(value)
      }
      if (!isNaN(value) && value > max) {
        max = value
      }
    })
    if (max === Number.MIN_SAFE_INTEGER) {
      return null
    }
    return max
  }
}

export function createSumResolver(
  nodeInterfaceName: string
): GatsbyResolver<IGatsbyConnection<IGatsbyNode>, IFieldConnectionArgs> {
  return function sumResolver(source, args): number | null {
    const { field } = args
    const { edges } = source

    return edges.reduce<number | null>((prev, { node }) => {
      let value = getMaybeResolvedValue(node, field, nodeInterfaceName)

      if (typeof value !== `number`) {
        value = Number(value)
      }
      if (!isNaN(value)) {
        return (prev || 0) + value
      }
      return prev
    }, null)
  }
}

type IGatsbyGroupReturnValue<NodeType> = Array<
  IGatsbyConnection<NodeType> & {
    field: string
    fieldValue: string | undefined
  }
>

export function createGroupResolver(
  nodeInterfaceName: string
): GatsbyResolver<
  IGatsbyConnection<IGatsbyNode>,
  PaginatedArgs<IFieldConnectionArgs>
> {
  return function groupResolver(
    source,
    args
  ): IGatsbyGroupReturnValue<IGatsbyNode> {
    const { field } = args
    const { edges } = source
    const groupedResults: Record<string, Array<IGatsbyNode>> = edges.reduce(
      (acc, { node }) => {
        const value = getMaybeResolvedValue(node, field, nodeInterfaceName)
        const values = Array.isArray(value) ? value : [value]
        values
          .filter(value => value != null)
          .forEach(value => {
            const key = value instanceof Date ? value.toISOString() : value
            acc[key] = (acc[key] || []).concat(node)
          })
        return acc
        // Note: using Object.create on purpose:
        //   object key may be arbitrary string including reserved words (i.e. `constructor`)
        //   see: https://github.com/gatsbyjs/gatsby/issues/22508
      },
      Object.create(null)
    )

    return Object.keys(groupedResults)
      .sort()
      .reduce(
        (acc: IGatsbyGroupReturnValue<IGatsbyNode>, fieldValue: string) => {
          const entries = groupedResults[fieldValue] || []
          acc.push({
            ...paginate(
              {
                entries: new GatsbyIterable(entries),
                totalCount: async () => entries.length,
              },
              args
            ),
            field:
              typeof field === `string`
                ? field
                : pathObjectToPathString(field).path,
            fieldValue,
          })
          return acc
        },
        []
      )
  }
}

export function paginate(
  results: IQueryResult,
  params: { skip?: number; limit?: number; resultOffset?: number }
): IGatsbyConnection<IGatsbyNode> {
  const { resultOffset = 0, skip = 0, limit } = params
  if (resultOffset > skip) {
    throw new Error("Result offset cannot be greater than `skip` argument")
  }
  const allItems = Array.from(results.entries)

  const start = skip - resultOffset
  const items = allItems.slice(start, limit && start + limit)

  const totalCount = results.totalCount
  const pageCount = async (): Promise<number> => {
    const count = await totalCount()
    return limit
      ? Math.ceil(skip / limit) + Math.ceil((count - skip) / limit)
      : skip
      ? 2
      : 1
  }
  const currentPage = limit ? Math.ceil(skip / limit) + 1 : skip ? 2 : 1
  const hasPreviousPage = currentPage > 1
  const hasNextPage = limit ? allItems.length - start > limit : false

  return {
    totalCount,
    edges: items.map((item, i, arr) => {
      return {
        node: item,
        next: arr[i + 1],
        previous: arr[i - 1],
      }
    }),
    nodes: items,
    pageInfo: {
      currentPage,
      hasPreviousPage,
      hasNextPage,
      itemCount: items.length,
      pageCount,
      perPage: limit,
      totalCount,
    },
  }
}

export function link<TSource, TArgs>(
  options: {
    by: string
    type?: GraphQLType
    from?: string
    fromNode?: boolean
  } = {
    by: `id`,
  },
  fieldConfig: GraphQLFieldConfig<
    TSource,
    IGatsbyResolverContext<TSource, TArgs>,
    TArgs
  >
): GatsbyResolver<TSource, TArgs> {
  // Note: we explicitly make an attempt to prevent using the `async` keyword because often
  //       it does not return a promise and this makes a significant difference at scale.

  return function linkResolver(
    source,
    args,
    context,
    info
  ): ResolvedLink | Promise<ResolvedLink> {
    const resolver = fieldConfig.resolve || context.defaultFieldResolver
    const fieldValueOrPromise = resolver(source, args, context, {
      ...info,
      from: options.from || info.from,
      fromNode: options.from ? options.fromNode : info.fromNode,
    })

    // Note: for this function, at scale, conditional .then is more efficient than generic await
    if (typeof fieldValueOrPromise?.then === `function`) {
      return fieldValueOrPromise.then(fieldValue =>
        linkResolverValue(fieldValue, args, context, info)
      )
    }

    return linkResolverValue(fieldValueOrPromise, args, context, info)
  }

  function linkResolverValue(
    fieldValue,
    args,
    context,
    info
  ): ResolvedLink | Promise<ResolvedLink> {
    if (fieldValue == null) {
      return null
    }

    const returnType = getNullableType(options.type || info.returnType)
    const type = getNamedType(returnType)

    if (options.by === `id`) {
      if (Array.isArray(fieldValue)) {
        return context.nodeModel.getNodesByIds(
          { ids: fieldValue, type: type },
          { path: context.path }
        )
      } else {
        return context.nodeModel.getNodeById(
          { id: fieldValue, type: type },
          { path: context.path }
        )
      }
    }

    // Return early if fieldValue is [] since { in: [] } doesn't make sense
    if (Array.isArray(fieldValue) && fieldValue.length === 0) {
      return fieldValue
    }

    const runQueryArgs = args as TArgs & { filter: Record<string, any> }
    runQueryArgs.filter = options.by.split(`.`).reduceRight(
      (acc: Record<string, any>, key: string) => {
        const obj = {}
        obj[key] = acc
        return obj
      },
      Array.isArray(fieldValue) ? { in: fieldValue } : { eq: fieldValue }
    )

    const firstOnly = !(returnType instanceof GraphQLList)

    if (context.stats) {
      context.stats.totalRunQuery++
      if (firstOnly) {
        context.stats.totalPluralRunQuery++
      }
    }

    if (firstOnly) {
      return context.nodeModel
        .findOne(
          {
            query: runQueryArgs,
            type,
            stats: context.stats,
            tracer: context.tracer,
          },
          { path: context.path }
        )
        .then(result => linkResolverQueryResult(fieldValue, result, returnType))
    }

    return context.nodeModel
      .findAll(
        {
          query: runQueryArgs,
          type,
          stats: context.stats,
          tracer: context.tracer,
        },
        { path: context.path }
      )
      .then(({ entries }) =>
        linkResolverQueryResult(fieldValue, Array.from(entries), returnType)
      )
  }

  function linkResolverQueryResult(
    fieldValue,
    queryResult,
    returnType
  ): IGatsbyNode | Array<IGatsbyNode> {
    if (
      returnType instanceof GraphQLList &&
      Array.isArray(fieldValue) &&
      Array.isArray(queryResult)
    ) {
      return fieldValue.map(value =>
        queryResult.find(obj => getValueAt(obj, options.by) === value)
      )
    } else {
      return queryResult
    }
  }
}

export function fileByPath<TSource, TArgs>(
  options: {
    from?: string
    fromNode?: boolean
  } = {},
  fieldConfig
): GatsbyResolver<TSource, TArgs> {
  return async function fileByPathResolver(
    source,
    args,
    context,
    info
  ): Promise<IGatsbyNode | nestedListOfNodes | null> {
    const resolver = fieldConfig.resolve || context.defaultFieldResolver
    const fieldValue: nestedListOfStrings = await resolver(
      source,
      args,
      context,
      {
        ...info,
        from: options.from || info.from,
        fromNode: options.from ? options.fromNode : info.fromNode,
      }
    )

    if (fieldValue == null) {
      return null
    }

    // Find the File node for this node (we assume the node is something
    // like markdown which would be a child node of a File node).
    const parentFileNode = context.nodeModel.findRootNodeAncestor(
      source,
      node => node.internal && node.internal.type === `File`
    )

    async function queryNodesByPath(
      relPaths: nestedListOfStrings
    ): Promise<nestedListOfNodes> {
      const arr: nestedListOfNodes = []
      for (let i = 0; i < relPaths.length; ++i) {
        arr[i] = await (Array.isArray(relPaths[i])
          ? queryNodesByPath(relPaths[i] as nestedListOfStrings)
          : queryNodeByPath(relPaths[i] as string))
      }
      return arr
    }

    function queryNodeByPath(relPath: string): Promise<IGatsbyNode> {
      return context.nodeModel.findOne({
        query: {
          filter: {
            absolutePath: {
              eq: normalize(systemPath.resolve(parentFileNode.dir, relPath)),
            },
          },
        },
        type: `File`,
      })
    }

    if (Array.isArray(fieldValue)) {
      return queryNodesByPath(fieldValue)
    } else {
      return queryNodeByPath(fieldValue)
    }
  }
}

function getProjectedField(
  info: GraphQLResolveInfo,
  fieldName: string
): Array<string> {
  const selectionSet = info.fieldNodes[0].selectionSet
  if (selectionSet) {
    const fieldNodes = getFieldNodeByNameInSelectionSet(
      selectionSet,
      fieldName,
      info
    )

    if (fieldNodes.length === 0) {
      return []
    }

    const returnType = getNullableType(info.returnType)

    if (isObjectType(returnType) || isInterfaceType(returnType)) {
      const field = returnType.getFields()[fieldName]
      const fieldArg = field?.args?.find(arg => arg.name === `field`)
      if (fieldArg) {
        const fieldTC = getNullableType(fieldArg.type)

        if (isEnumType(fieldTC) || isInputObjectType(fieldTC)) {
          return fieldNodes.reduce(
            (acc: Array<string>, fieldNode: FieldNode) => {
              const fieldArg = fieldNode.arguments?.find(
                arg => arg.name.value === `field`
              )
              if (isEnumType(fieldTC)) {
                if (fieldArg?.value.kind === Kind.ENUM) {
                  const enumKey = fieldArg.value.value
                  const enumValue = fieldTC.getValue(enumKey)
                  if (enumValue) {
                    acc.push(enumValue.value)
                  }
                }
              } else if (isInputObjectType(fieldTC)) {
                const path: Array<string> = []
                let currentValue = fieldArg?.value
                while (currentValue) {
                  if (currentValue.kind === Kind.OBJECT) {
                    if (currentValue.fields.length !== 1) {
                      throw new Error(`Invalid field arg`)
                    }

                    const fieldArg = currentValue.fields[0]
                    path.push(fieldArg.name.value)
                    currentValue = fieldArg.value
                  } else {
                    currentValue = undefined
                  }
                }

                if (path.length > 0) {
                  const sortPath = path.join(`.`)
                  acc.push(sortPath)
                }
              }
              return acc
            },
            []
          )
        }
      }
    }
  }

  return []
}

function getFieldNodeByNameInSelectionSet(
  selectionSet: SelectionSetNode,
  fieldName: string,
  info: GraphQLResolveInfo
): Array<FieldNode> {
  return selectionSet.selections.reduce(
    (acc: Array<FieldNode>, selection: SelectionNode) => {
      if (selection.kind === Kind.FRAGMENT_SPREAD) {
        const fragmentDef = info.fragments[selection.name.value]
        if (fragmentDef) {
          return [
            ...acc,
            ...getFieldNodeByNameInSelectionSet(
              fragmentDef.selectionSet,
              fieldName,
              info
            ),
          ]
        }
      } else if (selection.kind === Kind.INLINE_FRAGMENT) {
        return [
          ...acc,
          ...getFieldNodeByNameInSelectionSet(
            selection.selectionSet,
            fieldName,
            info
          ),
        ]
      } /* FIELD_NODE */ else {
        if (selection.name.value === fieldName) {
          return [...acc, selection]
        }
      }
      return acc
    },
    []
  )
}

export const defaultFieldResolver: GatsbyResolver<any, any> =
  function defaultFieldResolver(source, args, context, info) {
    if (
      (typeof source == `object` && source !== null) ||
      typeof source === `function`
    ) {
      if (info.from) {
        if (info.fromNode) {
          const node = context.nodeModel.findRootNodeAncestor(source)
          if (!node) return null
          return getValueAt(node, info.from)
        }
        return getValueAt(source, info.from)
      }
      const property = source[info.fieldName]
      if (typeof property === `function`) {
        return source[info.fieldName](args, context, info)
      }
      return property
    }

    return null
  }

let WARNED_ABOUT_RESOLVERS = false
function badResolverInvocationMessage(missingVar: string, path?: Path): string {
  const resolverName = path ? `${pathToArray(path)} ` : ``
  return `GraphQL Resolver ${resolverName}got called without "${missingVar}" argument. This might cause unexpected errors.

It's likely that this has happened in a schemaCustomization with manually invoked resolver. If manually invoking resolvers, it's best to invoke them as follows:

  resolve(parent, args, context, info)

`
}

export function wrappingResolver<TSource, TArgs>(
  resolver: GatsbyResolver<TSource, TArgs>
): GatsbyResolver<TSource, TArgs> {
  // Note: we explicitly make an attempt to prevent using the `async` keyword because often
  //       it does not return a promise and this makes a significant difference at scale.
  //       GraphQL will gracefully handle the resolver result of a promise or non-promise.

  if (resolver[`isTracingResolver`]) {
    return resolver
  }

  const wrappedTracingResolver = function wrappedTracingResolver(
    parent,
    args,
    context,
    info
  ): Promise<any> {
    if (!WARNED_ABOUT_RESOLVERS) {
      if (!info) {
        reporter.warn(badResolverInvocationMessage(`info`))
        WARNED_ABOUT_RESOLVERS = true
      } else if (!context) {
        reporter.warn(badResolverInvocationMessage(`context`, info.path))
        WARNED_ABOUT_RESOLVERS = true
      }
    }

    let activity
    let time
    if (context?.tracer) {
      activity = context.tracer.createResolverActivity(
        info.path,
        `${info.parentType.name}.${info.fieldName}`
      )
      activity.start()
    }
    if (context?.telemetryResolverTimings) {
      time = process.hrtime.bigint()
    }

    const result = resolver(parent, args, context, info)

    if (!activity && !time) {
      return result
    }

    const endActivity = (): void => {
      if (context?.telemetryResolverTimings) {
        context.telemetryResolverTimings.push({
          name: `${info.parentType}.${info.fieldName}`,
          duration: Number(process.hrtime.bigint() - time) / 1000 / 1000,
        })
      }
      if (activity) {
        activity.end()
      }
    }
    if (typeof result?.then === `function`) {
      result.then(endActivity, endActivity)
    } else {
      endActivity()
    }
    return result
  }

  wrappedTracingResolver.isTracingResolver = true

  return wrappedTracingResolver
}

export const defaultResolver = wrappingResolver(defaultFieldResolver)
