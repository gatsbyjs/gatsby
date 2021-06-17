import { createTestWorker, GatsbyTestWorkerPool } from "./test-helpers"

let worker: GatsbyTestWorkerPool | undefined

afterEach(() => {
  if (worker) {
    worker.end()
    worker = undefined
  }
})

it(`worker can use reporter without crashing`, async () => {
  expect.assertions(1)
  worker = createTestWorker()

  try {
    const result = await worker.log(`log`)
    expect(result).toEqual(true)
  } catch (e) {
    expect(e).toBeFalsy()
  }
})
