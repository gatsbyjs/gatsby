import { IRunQueryArgs } from "../../types"
import {
  createDbQueriesFromObject,
  DbComparator,
  DbQuery,
  dbQueryToDottedField,
  getFilterStatement,
  prepareQueryArgs,
  sortBySpecificity,
} from "../../common/query"
import { isDesc } from "./common"

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
  const filterQueries = createDbQueriesFromObject(prepareQueryArgs(filter))
  const filterQueriesThatCanUseIndex = getQueriesThatCanUseIndex(filterQueries)
  const sortFields: Array<IndexField> = getSortFieldsThatCanUseIndex(sort)

  if (!sortFields.length && !filterQueriesThatCanUseIndex.length) {
    return []
  }
  if (!filterQueriesThatCanUseIndex.length) {
    return dedupeAndTrim(sortFields, maxFields)
  }
  if (!sortFields.length) {
    return dedupeAndTrim(toIndexFields(filterQueriesThatCanUseIndex), maxFields)
  }
  const overlap = findOverlappingFields(
    filterQueriesThatCanUseIndex,
    sortFields
  )
  if (!overlap.size) {
    // Filter and sort fields do not overlap.
    // In this case combined index for filter+sort only makes sense when all filters have `eq` predicate
    // Same as https://docs.mongodb.com/manual/tutorial/sort-results-with-indexes/#sort-and-non-prefix-subset-of-an-index
    const eqFields = getFieldsWithEqPredicate(filterQueriesThatCanUseIndex)

    if (eqFields.size === filterQueriesThatCanUseIndex.length) {
      const eqFilterFields: Array<IndexField> = [...eqFields].map(f => [f, 1])
      return dedupeAndTrim([...eqFilterFields, ...sortFields], maxFields)
    }
    // Single unbound range filter: "lt", "gt", "gte", "lte" (but not "in"): prefer sort fields
    if (
      filterQueriesThatCanUseIndex.length === 1 &&
      getFilterStatement(filterQueriesThatCanUseIndex[0]).comparator !==
        DbComparator.IN
    ) {
      return dedupeAndTrim(sortFields, maxFields)
    }
    // Otherwise prefer filter fields
    return dedupeAndTrim(toIndexFields(filterQueriesThatCanUseIndex), maxFields)
  }

  // There is an overlap:
  // First add all non-overlapping filter fields to index prefix, then all sort fields (including overlapping)
  const filterFields = filterQueriesThatCanUseIndex
    .map((q): IndexField => [dbQueryToDottedField(q), 1])
    .filter(([name]) => !overlap.has(name))

  return dedupeAndTrim([...filterFields, ...sortFields], maxFields)
}

const canUseIndex = new Set([
  DbComparator.EQ,
  DbComparator.IN,
  DbComparator.GTE,
  DbComparator.LTE,
  DbComparator.GT,
  DbComparator.LT,
])

/**
 * Returns queries that can potentially use index.
 * Returned list is sorted by query specificity
 */
function getQueriesThatCanUseIndex(all: Array<DbQuery>): Array<DbQuery> {
  return sortBySpecificity(
    all.filter(q => canUseIndex.has(getFilterStatement(q).comparator))
  )
}

function getSortFieldsThatCanUseIndex(
  querySortArg: IRunQueryArgs["queryArgs"]["sort"]
): Array<IndexField> {
  const sort = querySortArg || { fields: [], order: [] }
  const initialOrder = isDesc(sort?.order[0]) ? -1 : 1

  const sortFields: Array<IndexField> = []
  for (let i = 0; i < sort.fields.length; i++) {
    const field = sort.fields[i]
    const order = isDesc(sort.order[i]) ? -1 : 1
    if (order !== initialOrder) {
      // Mixed sort order is not supported by our indexes yet :/
      // See https://github.com/DoctorEvidence/lmdb-store/discussions/62#discussioncomment-898949
      break
    }
    sortFields.push([field, order])
  }
  return sortFields
}

function findOverlappingFields(
  filterQueries: Array<DbQuery>,
  sortFields: Array<IndexField>
): Set<string> {
  const overlap = new Set<string>()

  for (const [fieldName] of sortFields) {
    const filterQuery = filterQueries.find(
      q => dbQueryToDottedField(q) === fieldName
    )
    if (!filterQuery) {
      break
    }
    overlap.add(fieldName)
  }
  return overlap
}

function getFieldsWithEqPredicate(filterQueries: Array<DbQuery>): Set<string> {
  return new Set<string>(
    filterQueries
      .filter(
        filterQuery =>
          getFilterStatement(filterQuery).comparator === DbComparator.EQ
      )
      .map(filterQuery => dbQueryToDottedField(filterQuery))
  )
}

function toIndexFields(queries: Array<DbQuery>): IndexFields {
  return queries.map((q): IndexField => [dbQueryToDottedField(q), 1])
}

function dedupeAndTrim(fields: IndexFields, maxFields: number): IndexFields {
  return [...new Map(fields)].slice(0, maxFields)
}
