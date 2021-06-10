import { createTestWorker, GatsbyTestWorkerPool } from "./test-helpers"
import { store } from "../../../redux"
import * as path from "path"

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

it(`can load config and execute node API in worker`, async () => {
  worker = createTestWorker()

  const siteDirectory = path.join(__dirname, `fixtures`, `sample-site`)

  // plugin options for custom local plugin contains function (() => `foo`)
  await worker.loadConfigAndPlugins({ siteDirectory })

  // plugin API execute function from plugin options and store result in `global`
  await worker.runAPI(`createSchemaCustomization`)

  // getting result stored in `global`
  expect(await worker.getAPIRunResult()).toEqual(`foo`)
})
