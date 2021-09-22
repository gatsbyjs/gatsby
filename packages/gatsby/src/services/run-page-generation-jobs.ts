import { store } from "../redux/index"
import { createInternalJob } from "../utils/jobs/manager"
import { createJobV2FromInternalJob } from "../redux/actions/internal"

export function runPageGenerationJobs({ queryIds, buildId }): void {
  queryIds.pageQueryIds.forEach(queryId => {
    const job = createInternalJob(
      {
        name: `GENERATE_PAGE`,
        args: {
          path: queryId.path,
          buildId,
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
