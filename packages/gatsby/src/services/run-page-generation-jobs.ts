import path from "path"
import fs from "fs-extra"
import { chunk } from "lodash"
import { v4 } from "uuid"
import { store } from "../redux/index"
import { createInternalJob } from "../utils/jobs/manager"
import { createJobV2FromInternalJob } from "../redux/actions/internal"
import { replayWorkerActions } from "../utils/worker/pool"
import { savePageQueryResult } from "../utils/page-data"
import type { IDataTrackingResult } from "../schema/graphql-engine/entry"

const pageGenChunkSize =
  Number(process.env.GATSBY_PARALLEL_QUERY_CHUNK_SIZE) || 50

const publishChunkSize = Number(process.env.GATSBY_PAGE_GEN_CHUNK_SIZE) || 10

interface IQueryIds {
  pageQueryIds: Array<{ path: string }>
}

function jobResultTypeGuard(a: any): a is IDataTrackingResult {
  return Array.isArray(a?.actionsToReplay)
}

export async function runPageGenerationJobs(
  queryIds: IQueryIds,
  wait?: () => Promise<void>
): Promise<void> {
  const pageChunks = chunk(queryIds?.pageQueryIds, pageGenChunkSize)

  console.log(
    `Total Page Chunks ${pageChunks?.length}`,
    pageChunks.map(pageChunk => pageChunk.map(page => page.path))
  )

  const publishChunks = chunk(pageChunks, publishChunkSize)

  for (const publishChunk of publishChunks) {
    publishChunk.forEach(pageChunk => {
      const job = createInternalJob(
        {
          name: `GENERATE_PAGE`,
          args: {
            id: v4(),
            paths: pageChunk?.map(item => item?.path),
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

      store.dispatch(createJobV2FromInternalJob(job)).then(result => {
        pageChunk.forEach(item => {
          const queryData = fs.readJsonSync(
            path.join(
              global.__GATSBY.root,
              `public`,
              `page-data`,
              item.path === `/` ? `index` : item.path,
              `page-data.json`
            )
          )

          savePageQueryResult(
            global.__GATSBY.root,
            item.path,
            JSON.stringify(queryData?.result ?? {})
          )
        })

        if (jobResultTypeGuard(result)) {
          replayWorkerActions(result.actionsToReplay)
        }
      })
    })

    if (wait) {
      await wait()
    }
  }
}
