import { WorkerPool } from "gatsby-worker"
import reporter from "gatsby-cli/lib/reporter"
// import { cpuCoreCount } from "gatsby-core-utils"
import { initTracer, stopTracer } from "./utils/tracer"
import { Span } from "opentracing"

async function run(): Promise<void> {
  await initTracer(process.env.GATSBY_OPEN_TRACING_CONFIG_FILE ?? ``)

  const buildActivity = reporter.phantomActivity(`top`)
  buildActivity.start()

  // const numWorkers = Math.max(1, cpuCoreCount() - 1)
  const createWorkerActivity = reporter.phantomActivity(
    `creating worker pool`,
    {
      parentSpan: buildActivity.span,
    }
  )
  createWorkerActivity.start()
  const worker = new WorkerPool<typeof import("./test-child")>(
    require.resolve(`./test-child`),
    {
      numWorkers: 2,
      parentSpan: createWorkerActivity.span,
      spanClass: Span,
    }
  )

  createWorkerActivity.end()

  const workersActivity = reporter.phantomActivity(`worker`, {
    parentSpan: buildActivity.span,
  })
  workersActivity.start()
  await Promise.all([
    worker.single
      .test(["hello", "world"], workersActivity.span)
      .then(result => {
        console.log(result)
      }),
    worker.single.test(["foo", "bar"], workersActivity.span).then(result => {
      console.log(result)
    }),
    worker.single
      .test(["lorem", "ipsum"], workersActivity.span)
      .then(result => {
        console.log(result)
      }),
  ])
  workersActivity.end()

  const endWorkersActivity = reporter.phantomActivity(`end worker`, {
    parentSpan: buildActivity.span,
  })
  endWorkersActivity.start()
  await Promise.all(worker.end())
  endWorkersActivity.end()

  buildActivity.end()
  console.log(`end`)
  await stopTracer()
}

run()
