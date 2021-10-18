import { WorkerPool } from "gatsby-worker"

export async function validateEngines(directory: string): Promise<void> {
  const worker = new WorkerPool<typeof import("./child")>(
    require.resolve(`./child`),
    { numWorkers: 1, env: { GATSBY_OPEN_TRACING_CONFIG_FILE: `` } }
  )

  try {
    await worker.single.validate(directory)
  } finally {
    worker.end()
  }
}
