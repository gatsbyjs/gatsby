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
export function createDbQueriesFromObject(
  filter: Record<string, any>
): Array<DbQuery> {
  return createDbQueriesFromObjectNested(filter)
}

function createDbQueriesFromObjectNested(
  filter: Record<string, any>,
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
  resolvedFields: Record<string, unknown>
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

// Like above, but doesn't handle $elemMatch
export function objectToDottedField(
  obj: Record<string, unknown>,
  path: Array<string> = []
): Record<string, unknown> {
  let result = {}
  Object.keys(obj).forEach(key => {
    const value = obj[key]
    if (_.isPlainObject(value)) {
      const pathResult = objectToDottedField(
        value as Record<string, unknown>,
        path.concat(key)
      )
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
