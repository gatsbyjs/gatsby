import * as path from "path"
import fs from "fs-extra"
import { DocumentNode } from "graphql"
import { build } from "../../../schema"
import sourceNodesAndRemoveStaleNodes from "../../source-nodes"
import { saveStateForWorkers, store } from "../../../redux"
import { loadConfigAndPlugins } from "../../../bootstrap/load-config-and-plugins"
import {
  createTestWorker,
  describeWhenLMDB,
  GatsbyTestWorkerPool,
} from "./test-helpers"
import { getDataStore } from "../../../datastore"
import { CombinedState } from "redux"
import { IGatsbyState } from "../../../redux/types"
import type { watch as ChokidarWatchType } from "chokidar"

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

describeWhenLMDB(`worker (schema)`, () => {
  let stateFromWorker: CombinedState<IGatsbyState>

  beforeAll(async () => {
    store.dispatch({ type: `DELETE_CACHE` })
    const fileDir = path.join(process.cwd(), `.cache/redux`)
    await fs.emptyDir(fileDir)

    worker = createTestWorker()

    const siteDirectory = path.join(__dirname, `fixtures`, `sample-site`)
    await loadConfigAndPlugins({ siteDirectory })
    await worker.loadConfigAndPlugins({ siteDirectory })
    await sourceNodesAndRemoveStaleNodes({ webhookBody: {} })
    await getDataStore().ready()

    await build({ parentSpan: {} })

    saveStateForWorkers([`inferenceMetadata`])
    await worker.buildSchema()

    stateFromWorker = await worker.getState()
  })

  afterAll(() => {
    if (worker) {
      worker.end()
      worker = undefined
    }
    for (const watcher of mockWatchersToClose) {
      watcher.close()
    }
  })

  it(`should have functioning createSchemaCustomization`, async () => {
    const typeDefinitions = (stateFromWorker.schemaCustomization.types[0] as {
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
    // @ts-ignore - it exists
    const { data } = await worker?.getRunQueryResult(`
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
      four: nodeTypeOne {
        fieldsOnGraphQL
      }
    }
  `)

    expect(data.one.number).toBe(123)
    expect(data.two).toBe(null)
    expect(data.three.resolverField).toBe(`Custom String`)
  })

  it(`should have fieldsOnGraphQL from setFieldsOnGraphQLNodeType`, async () => {
    // @ts-ignore - it exists
    const { data } = await worker?.getRunQueryResult(`
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
      four: nodeTypeOne {
        fieldsOnGraphQL
      }
    }
  `)

    expect(data.four.fieldsOnGraphQL).toBe(`Another Custom String`)
  })
})
