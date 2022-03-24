import { chunk } from "lodash"
import { store } from "../redux/index"
import { createInternalJob } from "../utils/jobs/manager"
import { createJobV2FromInternalJob } from "../redux/actions/internal"

const pageGenChunkSize =
  Number(process.env.GATSBY_PARALLEL_QUERY_CHUNK_SIZE) || 50

export function runPageGenerationJobs(queryIds): void {
  const pageChunks = chunk(queryIds?.pageQueryIds, pageGenChunkSize)

  pageChunks.forEach(chunk => {
    const job = createInternalJob(
      {
        name: `GENERATE_PAGE`,
        args: {
          paths: chunk?.map(({ path }) => path),
        },
        inputPaths: [],
        outputDir: __dirname,
        plugin: {
          name: `gatsby`,
          version: `4.10.1`,
          resolve: __dirname,
        },
      },
      {
        name: `gatsby`,
        version: `4.10.1`,
        resolve: __dirname,
      }
    )

    createJobV2FromInternalJob(job)(store.dispatch, store.getState)
  })
}
