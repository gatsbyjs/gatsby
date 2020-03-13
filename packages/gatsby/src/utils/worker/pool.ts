import Worker from "jest-worker"
import { cpuCoreCount } from "gatsby-core-utils"
import { getFilePath } from "./page-data"
interface IGatsbyWorkerPool {
  getFilePath: typeof getFilePath
  renderHTML({
    htmlComponentRendererPath,
    paths,
    envVars,
  }: {
    htmlComponentRendererPath: string
    paths: string[]
    envVars: Array<[string, string | undefined]>
  }): Promise<void[]>
}

export type GatsbyWorkerPool = IGatsbyWorkerPool & Worker

export const create = (): GatsbyWorkerPool =>
  new Worker(require.resolve(`./child`), {
    numWorkers: cpuCoreCount(),
    forkOptions: {
      silent: false,
    },
  }) as GatsbyWorkerPool
