import { WorkerPool } from "gatsby-worker"

export async function validateEngines(directory: string): Promise<void> {
  const worker = new WorkerPool<typeof import("./child")>(
    require.resolve(`./child`),
    {
      numWorkers: 1,
      env: {
        // Do not "inherit" this env var for validation,
        // as otherwise validation will fail on any imports
        // that OpenTracing config might make
        GATSBY_OPEN_TRACING_CONFIG_FILE: ``,
      },
      silent: true,
    }
  )

  try {
    await worker.single.validate(directory)
  } finally {
    worker.end()
  }
}
