import { chunk } from "lodash"
import { v4 } from "uuid"
import { store } from "../redux/index"
import { createInternalJob } from "../utils/jobs/manager"
import { createJobV2FromInternalJob } from "../redux/actions/internal"
import fastq from "fastq"
import type Reporter from "gatsby-cli/lib/reporter"

const pageGenChunkSize =
  Number(process.env.GATSBY_PARALLEL_QUERY_CHUNK_SIZE) || 50

const publishChunkSize = Number(process.env.GATSBY_PAGE_GEN_CHUNK_SIZE) || 10

const publishConcurrency = Number(process.env.GATSBY_PAGE_GEN_CONCURRENCY) || 10

interface IQueryIds {
  pageQueryIds: Array<{ path: string }>
}

function worker({ pageChunk, store }, cb): void {
  const job = createInternalJob(
    {
      name: `GENERATE_PAGE`,
      args: {
        id: v4(),
        paths: pageChunk.map(item => item?.path),
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

  store
    .dispatch(createJobV2FromInternalJob(job))
    .then(() => {
      cb(null, null)
    })
    .catch(err => {
      cb(err, null)
    })
}

export function runPageGenerationJobs(
  queryIds: IQueryIds,
  reporter: typeof Reporter
): Promise<void> {
  const pageChunks = chunk(queryIds?.pageQueryIds, pageGenChunkSize)

  const activity = reporter.createProgress(
    `Running Page Generation (burst mode)`,
    queryIds?.pageQueryIds.length,
    0,
    {
      id: `page-generation`,
    }
  )
  activity.start()

  const publishChunks = chunk(pageChunks, publishChunkSize)

  const queue = fastq(worker, publishConcurrency)

  for (const publishChunk of publishChunks) {
    publishChunk.forEach(pageChunk => {
      if (pageChunk) {
        queue.push({ pageChunk, store }, () => {
          activity.tick(pageChunk.length)
        })
      }
    })
  }

  if (queue.idle()) {
    activity.end()
    return Promise.resolve()
  } else {
    return new Promise(resolve => {
      queue.drain = (): void => {
        setImmediate(() => {
          activity.end()
          resolve()
        })
      }
    })
  }
}
