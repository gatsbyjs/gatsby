import {
  createTestWorker,
  GatsbyTestWorkerPool,
  itWhenLMDB,
} from "./test-helpers"
import { store } from "../../../redux"
import * as path from "path"
import { waitUntilAllJobsComplete } from "../../jobs-manager"

let worker: GatsbyTestWorkerPool | undefined

beforeEach(() => {
  store.dispatch({ type: `DELETE_CACHE` })
})

afterEach(() => {
  if (worker) {
    worker.end()
    worker = undefined
  }
})

itWhenLMDB(`jobs...`, async () => {
  worker = createTestWorker(3)

  const siteDirectory = path.join(__dirname, `fixtures`, `sample-site`)

  await worker.all.loadConfigAndPlugins({
    siteDirectory,
    processFlags: false,
  })

  // plugin API creates a job
  await Promise.all(worker.all.runAPI(`createSchemaCustomization`))

  await waitUntilAllJobsComplete()

  const workersJobsMeta = await Promise.all(worker.all.getJobsMeta())

  const mainProcessJobsMeta = (global as any).jobs

  expect(mainProcessJobsMeta.createdOnThisThread).toMatchInlineSnapshot(
    `Array []`
  )

  expect(
    mainProcessJobsMeta.executedOnThisThread.sort((a, b) =>
      a.description.localeCompare(b.description)
    )
  ).toMatchInlineSnapshot(`
    Array [
      Object {
        "description": ".then() job",
      },
      Object {
        "description": "Awaited job",
      },
      Object {
        "description": "Different job created in all workers (worker #1)",
      },
      Object {
        "description": "Different job created in all workers (worker #2)",
      },
      Object {
        "description": "Different job created in all workers (worker #3)",
      },
      Object {
        "description": "Same job created in all workers",
      },
    ]
  `)

  expect(workersJobsMeta).toMatchInlineSnapshot(`
    Array [
      Object {
        "createdOnThisThread": Array [
          Object {
            "description": "Same job created in all workers",
          },
          Object {
            "description": "Different job created in all workers (worker #1)",
          },
          Object {
            "description": ".then() job",
          },
          Object {
            "description": "Awaited job",
          },
        ],
        "executedOnThisThread": Array [],
      },
      Object {
        "createdOnThisThread": Array [
          Object {
            "description": "Same job created in all workers",
          },
          Object {
            "description": "Different job created in all workers (worker #2)",
          },
        ],
        "executedOnThisThread": Array [],
      },
      Object {
        "createdOnThisThread": Array [
          Object {
            "description": "Same job created in all workers",
          },
          Object {
            "description": "Different job created in all workers (worker #3)",
          },
        ],
        "executedOnThisThread": Array [],
      },
    ]
  `)
})
