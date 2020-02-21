import * as _ from "lodash"

export interface IDbQueryQuery {
  type: "query"
  path: Array<string>
  query: IDbFilterStatement
}

export interface IDbQueryElemMatch {
  type: "elemMatch"
  path: Array<string>
  nestedQuery: DbQuery
}

export type DbQuery = IDbQueryQuery | IDbQueryElemMatch

export enum DbComparator {
  EQ = `$eq`,
  NE = `$ne`,
  GT = `$gt`,
  GTE = `$gte`,
  LT = `$lt`,
  LTE = `$lte`,
  IN = `$in`,
  NIN = `$nin`,
  REGEX = `$regex`,
  GLOB = `$glob`,
}

const DB_COMPARATOR_VALUES: Set<string> = new Set(Object.values(DbComparator))

function isDbComparator(value: string): value is DbComparator {
  return DB_COMPARATOR_VALUES.has(value)
}

type DbComparatorValue = string | number | boolean | RegExp | null

export interface IDbFilterStatement {
  comparator: DbComparator
  value: DbComparatorValue | Array<DbComparatorValue>
}

/**
 * Converts a nested mongo args object into array of DbQuery objects,
 * structured representation of each distinct path of the query. We convert
 * nested objects with multiple keys to separate instances.
 */
export function createDbQueriesFromObject(filter: object): Array<DbQuery> {
  return createDbQueriesFromObjectNested(filter)
}

function createDbQueriesFromObjectNested(
  filter: object,
  path: Array<string> = []
): Array<DbQuery> {
  const keys = Object.getOwnPropertyNames(filter)
  return _.flatMap(
    keys,
    (key: string): Array<DbQuery> => {
      if (key === `$elemMatch`) {
        const queries = createDbQueriesFromObjectNested(filter[key])
        return queries.map(query => {
          return {
            type: `elemMatch`,
            path: path,
            nestedQuery: query,
          }
        })
      } else if (isDbComparator(key)) {
        return [
          {
            type: `query`,
            path,
            query: {
              comparator: key,
              value: filter[key],
            },
          },
        ]
      } else {
        return createDbQueriesFromObjectNested(filter[key], path.concat([key]))
      }
    }
  )
}

export function prefixResolvedFields(
  queries: Array<DbQuery>,
  resolvedFields: object
): Array<DbQuery> {
  const dottedFields = objectToDottedField(resolvedFields)
  const dottedFieldKeys = Object.getOwnPropertyNames(dottedFields)
  queries.forEach(query => {
    const prefixPath = query.path.join(`.`)
    if (
      dottedFields[prefixPath] ||
      (dottedFieldKeys.some(dottedKey => dottedKey.startsWith(prefixPath)) &&
        query.type === `elemMatch`) ||
      dottedFieldKeys.some(dottedKey => prefixPath.startsWith(dottedKey))
    ) {
      query.path.unshift(`__gatsby_resolved`)
    }
  })
  return queries
}

export function dbQueryToSiftQuery(query: DbQuery): object {
  const result = {}
  if (query.type === `elemMatch`) {
    result[query.path.join(`.`)] = {
      $elemMatch: dbQueryToSiftQuery(query.nestedQuery),
    }
  } else if (query.path.length) {
    result[query.path.join(`.`)] = {
      [query.query.comparator]: query.query.value,
    }
  } else {
    return {
      [query.query.comparator]: query.query.value,
    }
  }
  return result
}

// Most of the below can be gone after we decide to remove loki

// Converts a nested mongo args object into a dotted notation. acc
// (accumulator) must be a reference to an empty object. The converted
// fields will be added to it. E.g
//
// {
//   internal: {
//     type: {
//       $eq: "TestNode"
//     },
//     content: {
//       $regex: new MiniMatch(v)
//     }
//   },
//   id: {
//     $regex: newMiniMatch(v)
//   }
// }
//
// After execution, acc would be:
//
// {
//   "internal.type": {
//     $eq: "TestNode"
//   },
//   "internal.content": {
//     $regex: new MiniMatch(v)
//   },
//   "id": {
//     $regex: // as above
//   }
// }
export function toDottedFields(
  filter: object,
  acc: object = {},
  path: Array<string> = []
): object {
  Object.keys(filter).forEach(key => {
    const value = filter[key]
    const nextValue = _.isPlainObject(value) && value[Object.keys(value)[0]]
    if (key === `$elemMatch`) {
      acc[path.join(`.`)] = { [`$elemMatch`]: toDottedFields(value) }
    } else if (_.isPlainObject(nextValue)) {
      toDottedFields(value, acc, path.concat(key))
    } else {
      acc[path.concat(key).join(`.`)] = value
    }
  })
  return acc
}

// Like above, but doesn't handle $elemMatch
export function objectToDottedField(
  obj: object,
  path: Array<string> = []
): object {
  let result = {}
  Object.keys(obj).forEach(key => {
    const value = obj[key]
    if (_.isPlainObject(value)) {
      const pathResult = objectToDottedField(value, path.concat(key))
      result = {
        ...result,
        ...pathResult,
      }
    } else {
      result[path.concat(key).join(`.`)] = value
    }
  })
  return result
}

export function liftResolvedFields(
  args: object,
  resolvedFields: object
): object {
  const dottedFields = objectToDottedField(resolvedFields)
  const dottedFieldKeys = Object.keys(dottedFields)
  const finalArgs = {}
  Object.keys(args).forEach(key => {
    const value = args[key]
    if (dottedFields[key]) {
      finalArgs[`__gatsby_resolved.${key}`] = value
    } else if (
      dottedFieldKeys.some(dottedKey => dottedKey.startsWith(key)) &&
      value.$elemMatch
    ) {
      finalArgs[`__gatsby_resolved.${key}`] = value
    } else if (dottedFieldKeys.some(dottedKey => key.startsWith(dottedKey))) {
      finalArgs[`__gatsby_resolved.${key}`] = value
    } else {
      finalArgs[key] = value
    }
  })
  return finalArgs
}
