import {
  OperationDefinitionNode,
  DocumentNode,
  print,
  ExecutionResult,
} from "graphql"
import { ISourcingContext } from "../../types"
import {
  IPaginationAdapter,
  PaginationAdapters,
} from "../../config/pagination-adapters"
import * as GraphQLAST from "../../utils/ast-nodes"
import {
  findPaginatedFieldPath,
  getFirstValueByPath,
  updateFirstValueByPath,
} from "../utils/field-path-utils"
import { MAX_QUERY_PAGES } from "../../constants"
import { inspect } from "util"

interface IPaginationPlan {
  document: DocumentNode
  operationName: string
  variables: object
  fieldPath: string[]
  fieldName: string
  adapter: IPaginationAdapter<any, any>
}

interface IPage {
  result: ExecutionResult
  fieldValue: unknown
  variables: object
}

export async function* paginate(
  context: ISourcingContext,
  plan: IPaginationPlan
): AsyncIterable<IPage> {
  const query = print(plan.document)
  let pageInfo: any = plan.adapter.start()
  let currentPage = 0

  while (pageInfo.hasNextPage) {
    const variables = { ...plan.variables, ...pageInfo.variables }

    const result = await context.execute({
      query,
      document: plan.document,
      operationName: plan.operationName,
      variables,
    })

    if (!result.data) {
      let message = `Failed to execute query ${plan.operationName}.\n`
      if (result.errors?.length) {
        message += `Errors:\n`
        message += result.errors.map(err => err.message).join(`\n\n`)
      }
      throw new Error(message)
    }

    if (currentPage++ > MAX_QUERY_PAGES) {
      // TODO: make MAX_QUERY_PAGES configurable?
      throw new Error(
        `Query ${plan.operationName} exceeded allowed maximum number of pages: ${currentPage}\n` +
          `  Pagination: ${plan.adapter.name}\n` +
          `  Last variables: ${inspect(variables)}`
      )
    }

    const page = getFirstValueByPath(result.data, plan.fieldPath)
    pageInfo = plan.adapter.next(pageInfo, page)

    yield { result, fieldValue: page, variables }
  }
}

export async function combinePages(
  pages: AsyncIterable<IPage>,
  plan: IPaginationPlan
): Promise<ExecutionResult | void> {
  let result: ExecutionResult | void
  let combinedFieldValue: unknown

  for await (const page of pages) {
    combinedFieldValue = combinedFieldValue
      ? plan.adapter.concat(combinedFieldValue, page.fieldValue)
      : page.fieldValue
    result = page.result
  }
  if (!result || !result.data) {
    return undefined
  }
  updateFirstValueByPath(result.data, plan.fieldPath, combinedFieldValue)
  return result
}

export function planPagination(
  context: ISourcingContext,
  document: DocumentNode,
  operationName: string,
  variables: object = {}
): IPaginationPlan {
  const adapter = resolvePaginationAdapter(
    document,
    operationName,
    context.paginationAdapters
  )
  const fieldPath = findPaginatedFieldPath(document, operationName, adapter)
  const fieldName = fieldPath[fieldPath.length - 1]

  if (!fieldName) {
    throw new Error(
      `Cannot find field to paginate in the query ${operationName}`
    )
  }

  return {
    document,
    operationName,
    variables,
    adapter,
    fieldName,
    fieldPath,
  }
}

export function resolvePaginationAdapter(
  document: DocumentNode,
  operationName: string,
  paginationAdapters: IPaginationAdapter<any, any>[] = PaginationAdapters
): IPaginationAdapter<any, any> {
  const queryNode = findQueryDefinitionNode(document, operationName)

  const variableNames =
    queryNode.variableDefinitions?.map(
      variable => variable.variable.name.value
    ) ?? []

  const variableSet = new Set(variableNames)
  const adapter = paginationAdapters.find(
    s =>
      (s.expectedVariableNames.length === 0 && variableNames.length === 0) ||
      s.expectedVariableNames.every(name => variableSet.has(name))
  )
  if (!adapter) {
    throw new Error(
      `Could not resolve pagination adapter for the query ${operationName}`
    )
  }

  return adapter
}

export function findQueryDefinitionNode(
  document: DocumentNode,
  operationName: string
): OperationDefinitionNode {
  const operations = document.definitions.filter(GraphQLAST.isOperation)
  const queryNode = operations.find(op => op.name?.value === operationName)

  if (!queryNode) {
    const documentName = document.loc?.source.name
    if (documentName) {
      throw new Error(
        `Query ${operationName} not found in the ${documentName}.`
      )
    } else {
      const otherQueries = operations
        .map(op => op.name?.value ?? `UnnamedQuery`)
        .join(`,`)
      throw new Error(
        `Query ${operationName} not found in the GraphQL document. ` +
          `Queries found in this document: ${otherQueries}`
      )
    }
  }
  return queryNode
}
