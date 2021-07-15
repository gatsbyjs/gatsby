import * as path from "path"
import fs from "fs-extra"
import GatsbyCacheLmdb from "../cache-lmdb"
import { describeWhenLMDB } from "../worker/__tests__/test-helpers"

let cache: GatsbyCacheLmdb | undefined

beforeAll(async () => {
  cache = new GatsbyCacheLmdb({ name: `__test__` })
  const fileDir = path.join(
    process.cwd(),
    `.cache/caches-lmdb-${process.env.JEST_WORKER_ID}`
  )
  await fs.emptyDir(fileDir)
})

describeWhenLMDB(`cache-lmdb`, () => {
  it(`it can be instantiated`, () => {
    if (!cache) fail(`cache not instantiated`)
  })
  it(`returns cache instance with get/set methods`, () => {
    expect(cache.get).toEqual(expect.any(Function))
    expect(cache.set).toEqual(expect.any(Function))
  })
  describe(`set`, () => {
    it(`resolves to the value it cached`, () =>
      expect(cache.set(`a`, `b`)).resolves.toBe(`b`))
  })
  describe(`get`, () => {
    it(`resolves to the found value`, () =>
      expect(cache.get(`a`)).resolves.toBe(`b`))
  })
})
