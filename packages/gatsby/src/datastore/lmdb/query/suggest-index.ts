import { IRunQueryArgs } from "../../types"
import {
  createDbQueriesFromObject,
  DbComparator,
  DbQuery,
  dbQueryToDottedField,
  getFilterStatement,
  prepareQueryArgs,
} from "../../common/query"
import { isDesc } from "./common"
import { getQueriesThatCanUseIndex } from "./filter-using-index"

interface ISelectIndexArgs {
  filter: IRunQueryArgs["queryArgs"]["filter"]
  sort: IRunQueryArgs["queryArgs"]["sort"]
  maxFields?: number
}

type IndexField = [fieldName: string, orderDirection: number]
type IndexFields = Array<IndexField>

export function suggestIndex({
  filter,
  sort,
  maxFields = 4,
}: ISelectIndexArgs): Array<IndexField> {
  sort = sort || { fields: [], order: [] }
  const dbQueries = createDbQueriesFromObject(prepareQueryArgs(filter))
  const queriesThatCanUseIndex = getQueriesThatCanUseIndex(dbQueries)

  // Mixed sort order is not supported by our indexes :/
  const sortFields: Array<IndexField> = []
  const initialOrder = isDesc(sort?.order[0]) ? -1 : 1

  for (let i = 0; i < sort.fields.length; i++) {
    const field = sort.fields[i]
    const order = isDesc(sort.order[i]) ? -1 : 1
    if (order !== initialOrder) {
      break
    }
    sortFields.push([field, order])
  }

  if (!sortFields.length && !queriesThatCanUseIndex.length) {
    return []
  }
  if (!queriesThatCanUseIndex.length) {
    return dedupeAndTrim(sortFields, maxFields)
  }
  if (!sortFields.length) {
    return dedupeAndTrim(toIndexFields(queriesThatCanUseIndex), maxFields)
  }

  const eqFields = new Set<string>(
    queriesThatCanUseIndex
      .filter(
        dbQuery => getFilterStatement(dbQuery).comparator === DbComparator.EQ
      )
      .map(dbQuery => dbQueryToDottedField(dbQuery))
  )

  // Remove sort fields having "eq" filter - they don't make any sense (TODO: maybe also remove fields having IN)
  // sortFields = sortFields.filter(([fieldName]) => !eqFields.has(fieldName))

  // Split sort fields into 2 parts: [...overlapping, ...nonOverlapping]
  const overlap = new Set()
  for (const [fieldName] of sortFields) {
    const dbQuery = queriesThatCanUseIndex.find(
      q => dbQueryToDottedField(q) === fieldName
    )
    if (!dbQuery) {
      break
    }
    overlap.add(fieldName)
  }

  if (!overlap.size) {
    // No overlap - in this case filter+sort only makes sense when all filters have `eq` comparator
    // Same as https://docs.mongodb.com/manual/tutorial/sort-results-with-indexes/#sort-and-non-prefix-subset-of-an-index
    if (eqFields.size === queriesThatCanUseIndex.length) {
      const eqFilterFields: Array<IndexField> = [...eqFields].map(f => [f, 1])
      return dedupeAndTrim([...eqFilterFields, ...sortFields], maxFields)
    }
    // Single unbound range filter: lt, gt, gte, lte: prefer sort fields
    if (
      queriesThatCanUseIndex.length === 1 &&
      getFilterStatement(queriesThatCanUseIndex[0]).comparator !==
        DbComparator.IN
    ) {
      return dedupeAndTrim(sortFields, maxFields)
    }
    // Otherwise prefer filter fields
    return dedupeAndTrim(toIndexFields(queriesThatCanUseIndex), maxFields)
  }

  // There is an overlap:
  // First add all non-overlapping filter fields to index prefix, then all sort fields (including overlapping)
  const filterFields = queriesThatCanUseIndex
    .map((q): IndexField => [dbQueryToDottedField(q), 1])
    .filter(([name]) => !overlap.has(name))

  return dedupeAndTrim([...filterFields, ...sortFields], maxFields)
}

function toIndexFields(queries: Array<DbQuery>): IndexFields {
  return queries.map((q): IndexField => [dbQueryToDottedField(q), 1])
}

function dedupeAndTrim(fields: IndexFields, maxFields: number): IndexFields {
  return [...new Map(fields)].slice(0, maxFields)
}
