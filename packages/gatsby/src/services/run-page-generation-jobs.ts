import { chunk } from "lodash"
import { v4 } from "uuid"
import { store } from "../redux/index"
import { createInternalJob } from "../utils/jobs/manager"
import { createJobV2FromInternalJob } from "../redux/actions/internal"
import fastq from "fastq"

const pageGenChunkSize =
  Number(process.env.GATSBY_PARALLEL_QUERY_CHUNK_SIZE) || 50

const publishChunkSize = Number(process.env.GATSBY_PAGE_GEN_CHUNK_SIZE) || 10

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

export function runPageGenerationJobs(queryIds: IQueryIds): Promise<void> {
  const pageChunks = chunk(queryIds?.pageQueryIds, pageGenChunkSize)

  console.log(
    `Total Page Chunks ${pageChunks?.length}`
    // pageChunks.map(pageChunk => pageChunk.map(page => page.path))
  )

  const publishChunks = chunk(pageChunks, publishChunkSize)

  const queue = fastq(worker, 10)

  for (const publishChunk of publishChunks) {
    publishChunk.forEach(pageChunk => {
      if (pageChunk) {
        queue.push({ pageChunk, store })
      }
    })
  }

  if (queue.idle()) {
    return Promise.resolve()
  } else {
    return new Promise(resolve => {
      queue.drain = (): void => {
        resolve()
      }
    })
  }
}
