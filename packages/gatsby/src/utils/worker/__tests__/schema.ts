import * as path from "path"
import fs from "fs-extra"
import type { watch as ChokidarWatchType } from "chokidar"
import { DocumentNode } from "graphql"
import { CombinedState } from "redux"
import { build } from "../../../schema"
import sourceNodesAndRemoveStaleNodes from "../../source-nodes"
import { savePartialStateToDisk, store } from "../../../redux"
import { loadConfig } from "../../../bootstrap/load-config"
import { loadPlugins } from "../../../bootstrap/load-plugins"
import { createTestWorker, GatsbyTestWorkerPool } from "./test-helpers"
import { getDataStore } from "../../../datastore"
import { IGatsbyState } from "../../../redux/types"
import { compileGatsbyFiles } from "../../parcel/compile-gatsby-files"

let worker: GatsbyTestWorkerPool | undefined

// when we load config and run sourceNodes on "main process" we start file watchers
// because of default `gatsby-plugin-page-creator` which would prevent test process from
// exiting gracefully without forcing exit
// to prevent that we keep track of created watchers and close them after all tests are done
const mockWatchersToClose = new Set<ReturnType<typeof ChokidarWatchType>>()
jest.mock(`chokidar`, () => {
  const chokidar = jest.requireActual(`chokidar`)
  const originalChokidarWatch = chokidar.watch

  chokidar.watch = (
    ...args: Parameters<typeof ChokidarWatchType>
  ): ReturnType<typeof ChokidarWatchType> => {
    const watcher = originalChokidarWatch.call(chokidar, ...args)
    mockWatchersToClose.add(watcher)
    return watcher
  }

  return chokidar
})

describe(`worker (schema)`, () => {
  let stateFromWorker: CombinedState<IGatsbyState>

  beforeAll(async () => {
    store.dispatch({ type: `DELETE_CACHE` })
    const fileDir = path.join(process.cwd(), `.cache/worker`)
    await fs.emptyDir(fileDir)

    worker = createTestWorker()

    const siteDirectory = path.join(__dirname, `fixtures`, `sample-site`)
    await compileGatsbyFiles(siteDirectory)
    const config = await loadConfig({
      siteDirectory,
    })
    await loadPlugins(config, siteDirectory)
    await Promise.all(worker.all.loadConfigAndPlugins({ siteDirectory }))
    await sourceNodesAndRemoveStaleNodes({ webhookBody: {} })
    await getDataStore().ready()

    await build({ parentSpan: {} })
    savePartialStateToDisk([`inferenceMetadata`])
    await Promise.all(worker.all.buildSchema())

    stateFromWorker = await worker.single.getState()
  })

  afterAll(async () => {
    if (worker) {
      await Promise.all(worker.end())
      worker = undefined
    }
    for (const watcher of mockWatchersToClose) {
      watcher.close()
    }
  })

  it(`should have functioning createSchemaCustomization`, async () => {
    const typeDefinitions = (
      stateFromWorker.schemaCustomization.types[0] as {
        typeOrTypeDef: DocumentNode
      }
    ).typeOrTypeDef.definitions

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
    expect(stateFromWorker.schema[`_typeMap`]).toEqual(
      expect.objectContaining({
        NodeTypeOne: `NodeTypeOne`,
        NodeTypeTwo: `NodeTypeTwo`,
      })
    )
  })

  it(`should have inferenceMetadata`, async () => {
    expect(stateFromWorker.inferenceMetadata).toEqual(
      expect.objectContaining({
        typeMap: expect.objectContaining({
          NodeTypeOne: expect.anything(),
        }),
      })
    )
  })

  it(`should have resolverField from createResolvers`, async () => {
    if (!worker) fail(`worker not defined`)

    const { data } = await worker.single.getRunQueryResult(`
    {
      one: nodeTypeOne {
        number
      }
      two: nodeTypeTwo {
        thisIsANumber
      }
      three: nodeTypeOne {
        resolverField
      }
    }
  `)
    if (!data) fail(`data not defined`)

    // @ts-ignore - This is a test
    expect(data.one.number).toBe(123)
    expect(data.two).toBe(null)
    // @ts-ignore - This is a test
    expect(data.three.resolverField).toBe(`Custom String`)
  })

  it(`should have fieldsOnGraphQL from setFieldsOnGraphQLNodeType`, async () => {
    if (!worker) fail(`worker not defined`)

    const { data } = await worker.single.getRunQueryResult(`
    {
      four: nodeTypeOne {
        fieldsOnGraphQL
      }
    }
  `)

    // @ts-ignore - This is a test
    expect(data.four.fieldsOnGraphQL).toBe(`Another Custom String`)
  })
})
