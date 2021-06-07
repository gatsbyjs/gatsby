import {
  createTestWorker,
  GatsbyTestWorkerPool,
  itWhenLMDB,
} from "./test-helpers"
import { store, saveState } from "../../../redux"
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

it(`worker doesn't load all of state persisted by main process`, async () => {
  store.dispatch({
    type: `CREATE_PAGE`,
    payload: {
      path: `/foo/`,
      component: `/foo`,
    },
    plugin: { name: `test` },
  })

  saveState()

  expect(store.getState().pages.get(`/foo/`)).toMatchInlineSnapshot(`
    Object {
      "component": "/foo",
      "componentPath": "/foo",
      "path": "/foo/",
    }
  `)

  worker = createTestWorker()

  const result = await worker.getPage()
  expect(result).toMatchInlineSnapshot(`
    Object {
      "component": "/foo",
      "componentPath": "/foo",
      "path": "/foo/",
    }
  `)
})
