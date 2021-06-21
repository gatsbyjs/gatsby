import { IIndexFields } from "./create-index"
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

export function suggestIndex({
  filter,
  sort,
  maxFields = 4,
}: ISelectIndexArgs): IIndexFields | undefined {
  const dbQueries = createDbQueriesFromObject(prepareQueryArgs(filter))
  const canUseIndex = getQueriesThatCanUseIndex(dbQueries)

  if (!canUseIndex.length && !sort?.fields.length) {
    return undefined
  }

  if (canUseIndex.length && sort?.fields.length) {
  }

  const indexFields: Array<[fieldName: string, direction: number]> = []

  canUseIndex.slice(0, 4).forEach(dbQuery => {
    indexFields.push([dbQueryToDottedField(dbQuery), 1])
  })
  sort?.fields.slice(0, 4).forEach((name, index) => {
    indexFields.push([name, isDesc(sort?.order[index]) ? -1 : 1])
  })

  return indexFields.reduce(
    (acc, [name, sort]) => Object.assign(acc, { [name]: sort }),
    Object.create(null)
  )
}

const rangeComparators = new Set<DbComparator>([
  DbComparator.IN,
  DbComparator.GT,
  DbComparator.LT,
  DbComparator.GTE,
  DbComparator.LTE,
])

function buildIdealIndex(
  dbQueries: Array<DbQuery>,
  sort: ISelectIndexArgs["sort"]
): void {
  // The ideal scenario:
  // 1. All sort fields in the index tail
  // 2. Range fields overlapping with
  const indexSuffix = sort?.fields ?? []

  for (const sortField of indexSuffix) {

  }

  // Remove all range and `eq` queries that can be resolved using this suffix
  const potentialPrefix: Array<DbQuery> = dbQueries.filter(
    q =>
      rangeComparators.has(getFilterStatement(q).comparator) &&
      indexSuffix.includes(dbQueryToDottedField(q))
  )

  // Find as many `eq` filters



  // Use any
}

function isDesc(
  sortOrder: "asc" | "desc" | "ASC" | "DESC" | boolean | undefined
): boolean {
  return sortOrder === `desc` || sortOrder === `DESC` || sortOrder === false
}
