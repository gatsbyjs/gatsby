import { store } from "../redux/index"
import { createInternalJob } from "../utils/jobs/manager"
import { createJobV2FromInternalJob } from "../redux/actions/internal"

export function runQueriesWithJobs(queryIds): void {
  queryIds.pageQueryIds.forEach(queryId => {
    const job = createInternalJob(
      {
        name: `RUN_QUERY`,
        args: {
          path: queryId.path,
        },
        inputPaths: [],
        outputDir: __dirname,
        plugin: {
          name: `gatsby`,
          version: `4.0.0`,
          resolve: __dirname,
        },
      },
      {
        name: `gatsby`,
        version: `4.0.0`,
        resolve: __dirname,
      }
    )

    createJobV2FromInternalJob(job)(store.dispatch, store.getState)
  })
}
