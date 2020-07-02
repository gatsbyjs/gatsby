import { DEFAULT_PAGE_SIZE } from "../../constants"
import { IPaginationAdapter } from "./types"

export const LimitOffset: IPaginationAdapter<unknown[], unknown> = {
  name: `LimitOffset`,
  expectedVariableNames: [`limit`, `offset`],
  start() {
    return {
      variables: { limit: DEFAULT_PAGE_SIZE, offset: 0 },
      hasNextPage: true,
    }
  },
  next(state, page) {
    const limit = Number(state.variables.limit) ?? DEFAULT_PAGE_SIZE
    const offset = Number(state.variables.offset) + limit
    return {
      variables: { limit, offset },
      hasNextPage: page.length === limit,
    }
  },
  concat(result, page) {
    return result.concat(page)
  },
  getItems(pageOrResult) {
    return pageOrResult
  },
}
