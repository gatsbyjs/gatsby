import Worker from "jest-worker"
import { cpuCoreCount } from "gatsby-core-utils"

export const create = (): Worker =>
  new Worker(require.resolve(`./child`), {
    numWorkers: Math.max(1, cpuCoreCount() - 1),
    forkOptions: {
      silent: false,
    },
  })
