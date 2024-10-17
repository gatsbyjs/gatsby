import { createTestWorker, GatsbyTestWorkerPool } from "./test-helpers"
import { store } from "../../../redux"
import * as path from "path"
import { compileGatsbyFiles } from "../../parcel/compile-gatsby-files"

let worker: GatsbyTestWorkerPool | undefined

beforeEach(() => {
  store.dispatch({ type: `DELETE_CACHE` })
})

afterEach(async () => {
  if (worker) {
    await Promise.all(worker.end())
    worker = undefined
  }
})

it(`can load config and execute node API in worker`, async () => {
  worker = createTestWorker()

  const siteDirectory = path.join(__dirname, `fixtures`, `sample-site`)
  await compileGatsbyFiles(siteDirectory)

  // plugin options for custom local plugin contains function (() => `foo`)
  await Promise.all(
    worker.all.loadConfigAndPlugins({
      siteDirectory,
    })
  )

  // plugin API execute function from plugin options and store result in `global`
  await Promise.all(worker.all.runAPI(`createSchemaCustomization`))

  // getting result stored in `global`
  expect(await worker.single.getAPIRunResult()).toEqual(`foo`)
})
