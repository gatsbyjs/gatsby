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

/**
 * Suggest index fields for this combination of filter and sort.
 *
 * Prioritizes sort fields over filter fields when can't use index
 * for both because sorting is expensive both CPU and memory-wise.
 */
export function suggestIndex({
  filter,
  sort,
  maxFields = 6,
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

  // Combined index for filter+sort only makes sense when all prefix fields have `eq` predicate
  // Same as https://docs.mongodb.com/manual/tutorial/sort-results-with-indexes/#sort-and-non-prefix-subset-of-an-index
  const sortDirection = sortFields[0][1]
  const eqFilterQueries = getEqQueries(filterQueriesThatCanUseIndex)
  const eqFilterFields = toIndexFields(eqFilterQueries, sortDirection)

  // Index prefix should not contain eq filters overlapping with sort fields
  const overlap = findOverlappingFields(eqFilterQueries, sortFields)

  return dedupeAndTrim(
    [
      ...eqFilterFields.filter(([name]) => !overlap.has(name)),
      ...sortFields,
      // Still append other filter fields to the tail of the index to leverage additional filtering
      //  of results using data stored in the index (without loading full node object)
      //  Note: fields previously listed in eqFilterFields and sortFields will be removed in dedupeAndTrim
      ...toIndexFields(filterQueriesThatCanUseIndex, sortDirection),
    ],
    maxFields
  )
}

const canUseIndex = new Set([
  DbComparator.EQ,
  DbComparator.IN,
  DbComparator.GTE,
  DbComparator.LTE,
  DbComparator.GT,
  DbComparator.LT,
  DbComparator.NIN,
  DbComparator.NE,
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

function getEqQueries(filterQueries: Array<DbQuery>): Array<DbQuery> {
  return filterQueries.filter(
    filterQuery =>
      getFilterStatement(filterQuery).comparator === DbComparator.EQ
  )
}

function toIndexFields(
  queries: Array<DbQuery>,
  sortDirection: number = 1
): IndexFields {
  return queries.map(
    (q): IndexField => [dbQueryToDottedField(q), sortDirection]
  )
}

function dedupeAndTrim(fields: IndexFields, maxFields: number): IndexFields {
  return [...new Map(fields)].slice(0, maxFields)
}
