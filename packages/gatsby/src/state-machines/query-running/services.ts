import type { MachineOptions } from "xstate"
import {
  extractQueries,
  writeOutRequires,
  calculateDirtyQueries,
  runStaticQueries,
  runPageQueries,
  runSliceQueries,
  waitUntilAllJobsComplete,
  writeOutRedirects,
} from "../../services"
import type { IQueryRunningContext } from "./types"

export const queryRunningServices: MachineOptions<
  IQueryRunningContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>["services"] = {
  extractQueries,
  writeOutRequires,
  calculateDirtyQueries,
  runStaticQueries,
  runPageQueries,
  runSliceQueries,
  waitUntilAllJobsComplete,
  writeOutRedirects,
}
