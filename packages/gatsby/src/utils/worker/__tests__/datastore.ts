import {
  createTestWorker,
  GatsbyTestWorkerPool,
  itWhenLMDB,
} from "./test-helpers"
import { store } from "../../../redux"
import { actions } from "../../../redux/actions"
import { getDataStore } from "../../../datastore"

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

itWhenLMDB(`worker can access node created in main process`, async () => {
  worker = createTestWorker()

  const testNodeId = `shared-node`

  expect(getDataStore().getNode(testNodeId)).toBeFalsy()
  expect(await worker.getNodeFromWorker(testNodeId)).toBeFalsy()

  const node = {
    id: testNodeId,
    parent: null,
    children: [],
    internal: { type: `SharedNode`, contentDigest: `0` },
    field: `should-be-accessible-in-worker`,
  }
  await store.dispatch(actions.createNode(node, { name: `test` }))
  await getDataStore().ready()

  const nodeStoredInMainProcess = getDataStore().getNode(testNodeId)
  const nodeStoredInWorkerProcess = await worker.getNodeFromWorker(testNodeId)

  expect(nodeStoredInWorkerProcess).toMatchInlineSnapshot(`
    Object {
      "children": Array [],
      "field": "should-be-accessible-in-worker",
      "id": "shared-node",
      "internal": Object {
        "contentDigest": "0",
        "counter": 1,
        "owner": "test",
        "type": "SharedNode",
      },
      "parent": null,
    }
  `)
  expect(nodeStoredInWorkerProcess).toEqual(nodeStoredInMainProcess)
})
