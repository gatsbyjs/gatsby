import { LimitOffset } from "./limit-offset"
import { RelayForward } from "./relay"
import { NoPagination } from "./no-pagination"

export * from "./types"
const PaginationAdapters = [NoPagination, LimitOffset, RelayForward]

export { LimitOffset, RelayForward, PaginationAdapters }
