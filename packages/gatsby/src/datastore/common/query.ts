import * as _ from "lodash"
import { prepareRegex } from "../../utils/prepare-regex"
import { makeRe } from "micromatch"

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

// TODO: merge with DbComparatorValue
export type FilterValueNullable =
  | string
  | number
  | boolean
  | null
  | undefined
  | RegExp // Only valid for $regex
  | Array<string | number | boolean | null | undefined>

// This is filter value in most cases
export type FilterValue =
  | string
  | number
  | boolean
  | RegExp // Only valid for $regex
  | Array<string | number | boolean>

// The value is an object with arbitrary keys that are either filter values or,
// recursively, an object with the same struct. Ie. `{a: {a: {a: 2}}}`
export interface IInputQuery {
  [key: string]: FilterValueNullable | IInputQuery
}
// Similar to IInputQuery except the comparator leaf nodes will have their
// key prefixed with `$` and their value, in some cases, normalized.
export interface IPreparedQueryArg {
  [key: string]: FilterValueNullable | IPreparedQueryArg
}

const DB_COMPARATOR_VALUES: Set<string> = new Set(Object.values(DbComparator))

function isDbComparator(value: string): value is DbComparator {
  return DB_COMPARATOR_VALUES.has(value)
}

export type DbComparatorValue = string | number | boolean | RegExp | null

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
  return _.flatMap(keys, (key: string): Array<DbQuery> => {
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
  })
}

/**
 * Takes a DbQuery structure and returns a dotted representation of a field referenced in this query.
 *
 * Example:
 * ```js
 *   const query = createDbQueriesFromObject({
 *     foo: { $elemMatch: { id: { $eq: 5 }, test: { $gt: 42 } } },
 *     bar: { $in: [`bar`] }
 *   })
 *   const result = query.map(dbQueryToDottedField)
 * ```
 * Returns:
 *   [`foo.id`, `foo.test`, `bar`]
 */
export function dbQueryToDottedField(query: DbQuery): string {
  const path: Array<string> = [...query.path]
  let currentQuery = query
  while (currentQuery.type === `elemMatch`) {
    currentQuery = currentQuery.nestedQuery
    path.push(...currentQuery.path)
  }
  return path.join(`.`)
}

export function getFilterStatement(dbQuery: DbQuery): IDbFilterStatement {
  let currentQuery = dbQuery
  while (currentQuery.type !== `query`) {
    currentQuery = currentQuery.nestedQuery
  }
  return currentQuery.query
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

/**
 * Transforms filters coming from input GraphQL query to mongodb-compatible format
 * (by prefixing comparators with "$").
 *
 * Example:
 *   { foo: { eq: 5 } } -> { foo: { $eq: 5 }}
 */
export function prepareQueryArgs(
  filterFields: Array<IInputQuery> | IInputQuery = {}
): IPreparedQueryArg {
  const filters = {}
  Object.keys(filterFields).forEach(key => {
    const value = filterFields[key]
    if (_.isPlainObject(value)) {
      filters[key === `elemMatch` ? `$elemMatch` : key] = prepareQueryArgs(
        value as IInputQuery
      )
    } else {
      switch (key) {
        case `regex`:
          if (typeof value !== `string`) {
            throw new Error(
              `The $regex comparator is expecting the regex as a string, not an actual regex or anything else`
            )
          }
          filters[`$regex`] = prepareRegex(value)
          break
        case `glob`:
          filters[`$regex`] = makeRe(value)
          break
        default:
          filters[`$${key}`] = value
      }
    }
  })
  return filters
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

const comparatorSpecificity = {
  [DbComparator.EQ]: 80,
  [DbComparator.IN]: 70,
  [DbComparator.GTE]: 60,
  [DbComparator.LTE]: 50,
  [DbComparator.GT]: 40,
  [DbComparator.LT]: 30,
  [DbComparator.NIN]: 20,
  [DbComparator.NE]: 10,
}

export function sortBySpecificity(all: Array<DbQuery>): Array<DbQuery> {
  return [...all].sort(compareBySpecificityDesc)
}

function compareBySpecificityDesc(a: DbQuery, b: DbQuery): number {
  const aComparator = getFilterStatement(a).comparator
  const bComparator = getFilterStatement(b).comparator
  if (aComparator === bComparator) {
    return 0
  }
  const aSpecificity = comparatorSpecificity[aComparator]
  const bSpecificity = comparatorSpecificity[bComparator]
  if (!aSpecificity || !bSpecificity) {
    throw new Error(
      `Unexpected comparator pair: ${aComparator}, ${bComparator}`
    )
  }
  return aSpecificity > bSpecificity ? -1 : 1
}
