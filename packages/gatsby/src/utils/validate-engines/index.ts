import { WorkerPool } from "gatsby-worker"

export async function validateEngines(directory: string): Promise<void> {
  const worker = new WorkerPool<typeof import("./child")>(
    require.resolve(`./child`),
    { numWorkers: 1 }
  )

  try {
    await worker.single.validate(directory)
  } finally {
    worker.end()
  }
}
