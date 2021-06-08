import Worker from "jest-worker"
import { cpuCoreCount } from "gatsby-core-utils"

import type { CreateWorkerPoolType } from "./types"

export type GatsbyWorkerPool = CreateWorkerPoolType<typeof import("./child")>

export const create = (): GatsbyWorkerPool => {
  process.env.GATSBY_WORKER_POOL_WORKER = `true`
  const worker = new Worker(require.resolve(`./child`), {
    numWorkers: Math.max(1, cpuCoreCount() - 1),
    forkOptions: {
      silent: false,
    },
  }) as GatsbyWorkerPool
  delete process.env.GATSBY_WORKER_POOL_WORKER

  return worker
}
