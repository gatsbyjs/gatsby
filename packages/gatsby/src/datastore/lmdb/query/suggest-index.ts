import { IRunQueryArgs } from "../../types"
import {
  createDbQueriesFromObject,
  DbComparator,
  DbQuery,
  dbQueryToDottedField,
  getFilterStatement,
  prepareQueryArgs,
} from "../../common/query"
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
  sort = { fields: [], order: [] },
  maxFields = 4,
}: ISelectIndexArgs): IndexFields | undefined {
  const dbQueries = createDbQueriesFromObject(prepareQueryArgs(filter))
  const queriesThatCanUseIndex = getQueriesThatCanUseIndex(dbQueries)

  const sortFields: Array<IndexField> = sort.fields.map((field, i) => [
    field,
    isDesc(sort?.order[i]) ? -1 : 1,
  ])

  if (!sortFields.length && !queriesThatCanUseIndex.length) {
    return undefined
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

function isDesc(
  sortOrder: "asc" | "desc" | "ASC" | "DESC" | boolean | undefined
): boolean {
  return sortOrder === `desc` || sortOrder === `DESC` || sortOrder === false
}
