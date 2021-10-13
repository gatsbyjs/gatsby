import { ServiceConfig } from "xstate"
import {
  extractQueries,
  writeOutRequires,
  calculateDirtyQueries,
  runStaticQueries,
  runPageQueries,
  waitUntilAllJobsComplete,
  writeOutRedirects,
} from "../../services"
import { IQueryRunningContext } from "./types"

export const queryRunningServices: Record<
  string,
  ServiceConfig<IQueryRunningContext>
> = {
  extractQueries,
  writeOutRequires,
  calculateDirtyQueries,
  runStaticQueries,
  runPageQueries,
  waitUntilAllJobsComplete,
  writeOutRedirects,
}
