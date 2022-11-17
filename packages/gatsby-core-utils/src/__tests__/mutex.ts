import path from "path"
import { remove, mkdirp } from "fs-extra"
import { createMutex } from "../mutex"
import * as storage from "../utils/get-storage"

jest.spyOn(storage, `getDatabaseDir`)

function sleep(timeout = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, timeout))
}

async function doAsync(
  mutex: ReturnType<typeof createMutex>,
  result: Array<string> = [],
  waitTime: number,
  id: string
): Promise<Array<string>> {
  await mutex.acquire()
  result.push(`start ${id}`)
  await sleep(waitTime)
  result.push(`stop ${id}`)
  await mutex.release()

  return result
}

describe(`mutex`, () => {
  const cachePath = path.join(__dirname, `.cache`)
  beforeAll(async () => {
    await mkdirp(cachePath)
    storage.getDatabaseDir.mockReturnValue(cachePath)
  })

  afterAll(async () => {
    await storage.closeDatabase()
    globalThis.__GATSBY_OPEN_LMDBS.delete(storage.getDatabaseDir())
    await remove(cachePath)
  })

  it(`should only allow one action go through at the same time`, async () => {
    const mutex = createMutex(`test-key`, 300)

    const result: Array<string> = []

    doAsync(mutex, result, 50, `1`)
    await sleep(0)
    await doAsync(mutex, result, 10, `2`)

    expect(result).toMatchInlineSnapshot(`
      Array [
        "start 1",
        "stop 1",
        "start 2",
        "stop 2",
      ]
    `)
  })

  it(`should generate the same mutex if key are identical`, async () => {
    const mutex1 = createMutex(`test-key`, 300)
    const mutex2 = createMutex(`test-key`, 300)

    const result: Array<string> = []

    const mutexPromise = doAsync(mutex1, result, 50, `1`)
    await sleep(0)
    await doAsync(mutex2, result, 10, `2`)
    await mutexPromise

    expect(result).toMatchInlineSnapshot(`
      Array [
        "start 1",
        "stop 1",
        "start 2",
        "stop 2",
      ]
    `)
  })

  it(`shouldn't wait if keys are different`, async () => {
    const mutex1 = createMutex(`test-key`, 300)
    const mutex2 = createMutex(`other-key`, 300)

    const result: Array<string> = []

    const mutexPromise = doAsync(mutex1, result, 50, `1`)
    await sleep(0)
    await doAsync(mutex2, result, 10, `2`)
    await mutexPromise

    expect(result).toMatchInlineSnapshot(`
      Array [
        "start 1",
        "start 2",
        "stop 2",
        "stop 1",
      ]
    `)
  })
})
