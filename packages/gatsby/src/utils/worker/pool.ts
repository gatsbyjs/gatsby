import Worker from "jest-worker"
import { cpuCoreCount } from "gatsby-core-utils"

export const create = (): Worker =>
  new Worker(require.resolve(`./child`), {
    numWorkers: cpuCoreCount(),
    forkOptions: {
      silent: false,
    },
  })
