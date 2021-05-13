const assert = require(`assert`)
const fs = require(`fs`)
const removeDir = require(`rimraf`)
const store = require(`../cache-fs.ts`)
const cacheDirectory = __dirname + `/cache`

function countFilesInCacheDir() {
  return fs.readdirSync(cacheDirectory).length
}

describe(`DiskStore`, function () {
  let cache
  // remove test directory before each test
  beforeEach(async function () {
    return new Promise(resolve => {
      removeDir(cacheDirectory, () => {
        cache = store.create({ path: cacheDirectory })
        resolve()
      })
    })
  })
  // remove test directory after last test
  afterEach(async function () {
    return new Promise(resolve => removeDir(cacheDirectory, resolve))
  })

  describe(`construction`, function () {
    it(`should create cache dir`, function () {
      assert(fs.existsSync(cache.options.path))
    })
  })

  describe(`get()`, function () {
    it(`should return undefined on non existing key callback`, async function () {
      return new Promise(resolve => {
        cache.get(`not existing key`, function (err, data) {
          expect(err).toEqual(null)
          expect(data).toEqual(undefined)
          resolve()
        })
      })
    })

    it(`should return undefined on non existing key promise`, async function () {
      const data = await cache.get(`not existing key`)
      expect(data).toEqual(undefined)
    })

    it(`should not be that slow reading the same non existing cache key sequentially`, async function () {
      for (let i = 0; i < 30; i++) {
        const data = await cache.get(`not existing key`)
        expect(data).toEqual(undefined)
      }
    })

    it(`should not be that slow reading the same non existing cache key parallel`, async function () {
      // this.slow(100)

      for (let i = 0; i < 20; i++) {
        await Promise.all(
          [1, 2, 3, 4, 5].map(async function () {
            const data = await cache.get(`not existing key`)
            expect(data).toEqual(undefined)
          })
        )
      }
    })

    it(`should not be that slow reading different non existing cache keys parallel`, async function () {
      // this.slow(30)

      await Promise.all(
        Array(30)
          .fill()
          .map(async function (v, i) {
            const data = await cache.get(`not existing key` + i)
            expect(data).toEqual(undefined)
          })
      )
    })
  })

  describe(`set()`, function () {
    it(`should create a file for each saved value`, async function () {
      await cache.set(`key`, `value`)
      expect(countFilesInCacheDir()).toEqual(1)
      await cache.set(`key2`, `value`)
      expect(countFilesInCacheDir()).toEqual(2)
    })

    it(`should save buffers in separate files promise`, async function () {
      await cache.set(`key`, Buffer.alloc(100000))
      expect(countFilesInCacheDir()).toEqual(2)
    })

    it(`should not modify the value while saving`, async function () {
      const value = {
        int: 5,
        bool: true,
        float: 0.1,
        buffer: Buffer.from(`Hello World!`),
        string: `#äö=)@€²(/&%$§"`,
        largeBuffer: Buffer.alloc(100000),
      }
      await cache.set(`key`, value)
      expect(value).toEqual({
        int: 5,
        bool: true,
        float: 0.1,
        buffer: Buffer.from(`Hello World!`),
        string: `#äö=)@€²(/&%$§"`,
        largeBuffer: Buffer.alloc(100000),
      })
    })
  })

  describe(`del()`, function () {
    it(`should not throw for deleting nonexisting key`, async function () {
      // this.slow(20)
      const cache = store.create({ path: cacheDirectory })
      await cache.del(`nonexisting key`)
      expect(true).toEqual(true)
    })

    it(`should not throw for deleting nonexisting key (subdirs)`, async function () {
      // this.slow(20)
      const cache = store.create({ path: cacheDirectory, subdirs: true })
      await cache.del(`nonexisting key`)
      expect(true).toEqual(true)
    })
  })

  describe(`set() and get()`, function () {
    it(`should load the same value that was saved (simple object)`, async function () {
      const originalValue = {
        int: 5,
        bool: true,
        float: 0.1,
        string: `#äö=)@€²(/&%$§"`,
      }
      await cache.set(`(simple object)`, originalValue)
      const loadedValue = await cache.get(`(simple object)`)
      expect(loadedValue).toEqual(originalValue)
    })

    it(`should load the same value that was saved (large buffers)`, async function () {
      // this.slow(500)
      // this.timeout(30000)

      const originalValue = {
        smallbuffer: Buffer.from(`Hello World!`),
        largeBuffer: Buffer.alloc(1000 * 1000 * 10 /* 10MB */, 5),
        largeBuffer2: Buffer.alloc(1000 * 1000 * 5 /* 5MB */, 100),
      }
      await cache.set(`(large buffers)`, originalValue)
      const loadedValue = await cache.get(`(large buffers)`)
      assert.deepEqual(originalValue, loadedValue)
    })

    it(`should not load expired data (global options)`, async function () {
      const cache = store.create({ path: cacheDirectory, ttl: 0 })
      await cache.set(`key`, `value`)
      const loadedValue = await cache.get(`key`)
      expect(loadedValue).toEqual(undefined)
    })

    it(`should not load expired data (set options)`, async function () {
      await cache.set(`key`, `value`, { ttl: 0 })
      const loadedValue = await cache.get(`key`)
      expect(loadedValue).toEqual(undefined)
    })

    it(`should work with numeric keys`, async function () {
      const originalValue = `value`
      await cache.set(5, originalValue)
      const loadedValue = await cache.get(5)
      expect(loadedValue).toEqual(originalValue)
    })

    it(`should work with numeric and string keys mixed`, async function () {
      const originalValue = `value`
      await cache.set(5, originalValue)
      const loadedValue = await cache.get(`5`)
      expect(loadedValue).toEqual(originalValue)
    })

    it(`should be able to get a value written by an other cache instance using the same directory`, async function () {
      const originalValue = `value`
      const cache1 = store.create({ path: cacheDirectory })
      const cache2 = store.create({ path: cacheDirectory })

      await cache1.set(`key`, originalValue)
      const loadedValue = await cache2.get(`key`)
      expect(loadedValue).toEqual(originalValue)
    })

    it(`should work with subdirs`, async function () {
      const cache = store.create({ path: cacheDirectory, subdirs: true })
      const originalValue = {
        int: 8,
        bool: true,
        float: 0.9,
        string: `dsfsdöv`,
      }
      await cache.set(`(simple object)`, originalValue)
      const loadedValue = await cache.get(`(simple object)`)
      expect(loadedValue).toEqual(originalValue)
    })

    it(`should be able to set & get a value on different instances simultaneously`, async function () {
      // this.slow(600)
      // this.timeout(5000)

      const cache1 = store.create({ path: cacheDirectory })
      const cache2 = store.create({ path: cacheDirectory })
      const cache3 = store.create({ path: cacheDirectory })

      const value1 = {
        int: 5,
        bool: true,
        float: Math.random(),
        buffer: Buffer.from(`Hello World1!`),
        string: `#äö=)@€²(/&%$§"1`,
        largeBuffer: Buffer.alloc(1),
      }
      const value2 = {
        int: 6,
        bool: true,
        float: Math.random(),
        buffer: Buffer.from(`Hello World2!`),
        string: `#äö=)@€²(/&%$§"2`,
        largeBuffer: Buffer.alloc(2),
      }
      const value3 = {
        int: 7,
        bool: true,
        float: Math.random(),
        buffer: Buffer.from(`Hello World3!`),
        string: `#äö=)@€²(/&%$§"3`,
        largeBuffer: Buffer.alloc(3),
      }

      await Promise.all([
        cache1.set(`key`, value1),
        cache2.set(`key`, value2),
        cache3.set(`key`, value3),
      ])
      const values = await Promise.all([
        cache1.get(`key`),
        cache2.get(`key`),
        cache3.get(`key`),
      ])
      // all caches should be the same
      expect(values[0]).toEqual(values[1])
      expect(values[0]).toEqual(values[2])

      // the cache should be one of the values that was stored to it
      try {
        expect(values[0]).toEqual(values[1])
      } catch (e) {
        try {
          expect(values[0]).toEqual(value2)
        } catch (e) {
          expect(values[0]).toEqual(value3)
        }
      }
    })

    it(`should work with zip option`, async function () {
      const cache = store.create({ path: cacheDirectory, zip: true })
      const originalValue = {
        int: 5,
        bool: true,
        float: Math.random(),
        buffer: Buffer.from(`Hello World1!`),
        string: `#äö=)@€²(/&%$§"1`,
        largeBuffer: Buffer.alloc(1),
      }

      await cache.set(`key`, originalValue)
      const loadedValue = await cache.get(`key`)
      expect(loadedValue).toEqual(originalValue)
    })

    it(`should be able to store the number Infinity`, async function () {
      const cache = store.create({ path: cacheDirectory })
      const originalValue = Infinity

      await cache.set(`key`, originalValue)
      const loadedValue = await cache.get(`key`)
      expect(loadedValue).toEqual(originalValue)
    })
  })
})
