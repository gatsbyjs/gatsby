import Worker from "jest-worker"
import { cpuCoreCount } from "gatsby-core-utils"

// we only import it to get types, typescript will remove it from code if it's only used for types
import * as exposedWorkerPoolMethods from "./child"
import type { CreateWorkerPoolType } from "./types"

export type GatsbyWorkerPool = CreateWorkerPoolType<
  typeof exposedWorkerPoolMethods
>

export const create = (): GatsbyWorkerPool =>
  new Worker(require.resolve(`./child`), {
    numWorkers: Math.max(1, cpuCoreCount() - 1),
    forkOptions: {
      silent: false,
    },
  }) as GatsbyWorkerPool
