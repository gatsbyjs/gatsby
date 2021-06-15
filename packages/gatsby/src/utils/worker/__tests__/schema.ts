import * as path from "path"
import fs from "fs-extra"
import { DocumentNode } from "graphql"
import { build } from "../../../schema"
import { saveStateForWorkers, store } from "../../../redux"
import { loadConfigAndPlugins } from "../../../bootstrap/load-config-and-plugins"
import { createTestWorker, GatsbyTestWorkerPool } from "./test-helpers"

let worker: GatsbyTestWorkerPool | undefined

describe(`worker (schema)`, () => {
  let state

  beforeAll(async () => {
    store.dispatch({ type: `DELETE_CACHE` })
    const fileDir = path.join(process.cwd(), `.cache/redux`)
    fs.emptyDirSync(fileDir)

    worker = createTestWorker()

    const siteDirectory = path.join(__dirname, `fixtures`, `sample-site`)
    await loadConfigAndPlugins({ siteDirectory })
    await worker.loadConfigAndPlugins({ siteDirectory })
    await worker.runAPI(`sourceNodes`)

    await build({ parentSpan: {} })

    saveStateForWorkers([`inferenceMetadata`])
    await worker.buildSchema()

    state = await worker.getState()
  })

  afterAll(() => {
    if (worker) {
      worker.end()
      worker = undefined
    }
  })

  it(`should have functioning createSchemaCustomization`, async () => {
    const typeDefinitions = (state.schemaCustomization.types[0] as {
      typeOrTypeDef: DocumentNode
    }).typeOrTypeDef.definitions

    expect(typeDefinitions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fields: expect.arrayContaining([
            expect.objectContaining({
              name: expect.objectContaining({
                value: `thisIsANumber`,
              }),
              type: expect.objectContaining({
                name: expect.objectContaining({
                  value: `Int`,
                }),
              }),
            }),
          ]),
        }),
        expect.objectContaining({
          fields: expect.arrayContaining([
            expect.objectContaining({
              name: expect.objectContaining({
                value: `overriddenString`,
              }),
              type: expect.objectContaining({
                name: expect.objectContaining({
                  value: `Int`,
                }),
              }),
            }),
          ]),
        }),
      ])
    )
  })

  it(`should have NodeTypeOne & NodeTypeTwo in schema`, async () => {
    expect(state.schema[`_typeMap`]).toEqual(
      expect.objectContaining({
        NodeTypeOne: `NodeTypeOne`,
        NodeTypeTwo: `NodeTypeTwo`,
      })
    )
  })

  // TODO: Really flaky locally! Trigger
  it(`should have inferenceMetadata`, async () => {
    expect(state.inferenceMetadata).toEqual(
      expect.objectContaining({
        typeMap: expect.objectContaining({
          NodeTypeOne: expect.anything(),
        }),
      })
    )
  })
})
