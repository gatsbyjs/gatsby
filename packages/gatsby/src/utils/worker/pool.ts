import Worker from "jest-worker"
import { cpuCoreCount } from "gatsby-core-utils"

import type { renderHTMLProd, renderHTMLDev, buildSchema } from "./child"

export interface IGatsbyWorkerPool extends Worker {
  renderHTMLProd: typeof renderHTMLProd
  renderHTMLDev: typeof renderHTMLDev
  buildSchema: typeof buildSchema
}

export const numWorkers = Math.max(1, cpuCoreCount() - 1)

export const create = (): IGatsbyWorkerPool =>
  new Worker(require.resolve(`./child`), {
    numWorkers,
    forkOptions: {
      silent: false,
    },
    computeWorkerKey(method, ...args): string | null {
      if (method === `buildSchema`) {
        // so jest-worker doesn't really have a way to run same method on all workers
        // this tries to generate different workerKey so that when we call buildSchema
        // as many times as we have workers - I'm not sure if that would guarantee that
        // even gives any guarantees :shrug:
        return args?.[0]?.workerNumber as string
      }

      return null
    },
  }) as IGatsbyWorkerPool
