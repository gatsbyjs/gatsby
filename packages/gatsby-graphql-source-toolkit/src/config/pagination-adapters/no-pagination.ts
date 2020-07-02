import { IPaginationAdapter } from "./types"

export const NoPagination: IPaginationAdapter<unknown[], unknown> = {
  name: `NoPagination`,
  expectedVariableNames: [],
  start() {
    return {
      variables: {},
      hasNextPage: true,
    }
  },
  next() {
    return {
      variables: {},
      hasNextPage: false,
    }
  },
  concat(result) {
    return result
  },
  getItems(pageOrResult) {
    return pageOrResult
  },
}
