import assert from "assert";
import fs from "fs";
import removeDir from "rimraf";
import { create } from "../cache-fs.ts";
const cacheDirectory = __dirname + "/cache";

function countFilesInCacheDir(): number {
  return fs.readdirSync(cacheDirectory).length;
}

describe("DiskStore", function (): void {
  let cache;
  // remove test directory before each test
  beforeEach(async function () {
    return new Promise((resolve) => {
      removeDir.rimraf(cacheDirectory).then(() => {
        cache = create({ path: cacheDirectory });
        resolve(undefined);
      });
    });
  });
  // remove test directory after last test
  afterEach(async function () {
    return new Promise((resolve) =>
      removeDir.rimraf(cacheDirectory).then(resolve),
    );
  });

  describe("construction", function () {
    it("should create cache dir", function () {
      assert(fs.existsSync(cache.options.path));
    });
  });

  describe("get()", function () {
    it("should return undefined on non existing key callback", async function () {
      return new Promise((resolve) => {
        cache.get("not existing key", function (err, data) {
          expect(err).toEqual(null);
          expect(data).toEqual(undefined);
          resolve(undefined);
        });
      });
    });

    it("should return undefined on non existing key promise", async function () {
      const data = await cache.get("not existing key");
      expect(data).toEqual(undefined);
    });

    it("should not be that slow reading the same non existing cache key sequentially", async function () {
      for (let i = 0; i < 30; i++) {
        const data = await cache.get("not existing key");
        expect(data).toEqual(undefined);
      }
    });

    it("should not be that slow reading the same non existing cache key parallel", async function () {
      // this.slow(100)

      for (let i = 0; i < 20; i++) {
        await Promise.all(
          [1, 2, 3, 4, 5].map(async function () {
            const data = await cache.get("not existing key");
            expect(data).toEqual(undefined);
          }),
        );
      }
    });

    it("should not be that slow reading different non existing cache keys parallel", async function () {
      // this.slow(30)

      await Promise.all(
        Array(30)
          .fill(undefined)
          .map(async function (v, i) {
            const data = await cache.get("not existing key" + i);
            expect(data).toEqual(undefined);
          }),
      );
    });
  });

  describe("set()", function () {
    it("should create a file for each saved value", async function () {
      await cache.set("key", "value");
      expect(countFilesInCacheDir()).toEqual(1);
      await cache.set("key2", "value");
      expect(countFilesInCacheDir()).toEqual(2);
    });

    it("should save buffers in separate files promise", async function () {
      await cache.set("key", Buffer.alloc(100000));
      expect(countFilesInCacheDir()).toEqual(2);
    });

    it("should not modify the value while saving", async function () {
      const value = {
        int: 5,
        bool: true,
        float: 0.1,
        buffer: Buffer.from("Hello World!"),
        string: '#äö=)@€²(/&%$§"',
        largeBuffer: Buffer.alloc(100000),
      };
      await cache.set("key", value);
      expect(value).toEqual({
        int: 5,
        bool: true,
        float: 0.1,
        buffer: Buffer.from("Hello World!"),
        string: '#äö=)@€²(/&%$§"',
        largeBuffer: Buffer.alloc(100000),
      });
    });
  });

  describe("del()", function () {
    it("should not throw for deleting nonexisting key", async function () {
      // this.slow(20)
      const cache = create({ path: cacheDirectory });
      // @ts-ignore prototype
      await cache.del("nonexisting key");
      expect(true).toEqual(true);
    });

    it("should not throw for deleting nonexisting key (subdirs)", async function () {
      // this.slow(20)
      const cache = create({ path: cacheDirectory, subdirs: true });
      // @ts-ignore prototype
      await cache.del("nonexisting key");
      expect(true).toEqual(true);
    });
  });

  describe("set() and get()", function () {
    it("should load the same value that was saved (simple object)", async function () {
      const originalValue = {
        int: 5,
        bool: true,
        float: 0.1,
        string: '#äö=)@€²(/&%$§"',
      };
      await cache.set("(simple object)", originalValue);
      const loadedValue = await cache.get("(simple object)");
      expect(loadedValue).toEqual(originalValue);
    });

    it("should load the same value that was saved (large buffers)", async function () {
      // this.slow(500)
      // this.timeout(30000)

      const originalValue = {
        smallbuffer: Buffer.from("Hello World!"),
        largeBuffer: Buffer.alloc(1000 * 1000 * 10 /* 10MB */, 5),
        largeBuffer2: Buffer.alloc(1000 * 1000 * 5 /* 5MB */, 100),
      };
      await cache.set("(large buffers)", originalValue);
      const loadedValue = await cache.get("(large buffers)");
      assert.deepEqual(originalValue, loadedValue);
    });

    it("should not load expired data (global options)", async function () {
      const cache = create({ path: cacheDirectory, ttl: 0 });
      // @ts-ignore prototype
      await cache.set("key", "value");
      // @ts-ignore prototype
      const loadedValue = await cache.get("key");
      expect(loadedValue).toEqual(undefined);
    });

    it("should not load expired data (set options)", async function () {
      await cache.set("key", "value", { ttl: 0 });
      const loadedValue = await cache.get("key");
      expect(loadedValue).toEqual(undefined);
    });

    it("should work with numeric keys", async function () {
      const originalValue = "value";
      await cache.set(5, originalValue);
      const loadedValue = await cache.get(5);
      expect(loadedValue).toEqual(originalValue);
    });

    it("should work with numeric and string keys mixed", async function () {
      const originalValue = "value";
      await cache.set(5, originalValue);
      const loadedValue = await cache.get("5");
      expect(loadedValue).toEqual(originalValue);
    });

    it("should be able to get a value written by an other cache instance using the same directory", async function () {
      const originalValue = "value";
      const cache1 = create({ path: cacheDirectory });
      const cache2 = create({ path: cacheDirectory });

      // @ts-ignore prototype
      await cache1.set("key", originalValue);
      // @ts-ignore prototype
      const loadedValue = await cache2.get("key");
      expect(loadedValue).toEqual(originalValue);
    });

    it("should work with subdirs", async function () {
      const cache = create({ path: cacheDirectory, subdirs: true });
      const originalValue = {
        int: 8,
        bool: true,
        float: 0.9,
        string: "dsfsdöv",
      };
      // @ts-ignore prototype
      await cache.set("(simple object)", originalValue);
      // @ts-ignore prototype
      const loadedValue = await cache.get("(simple object)");
      expect(loadedValue).toEqual(originalValue);
    });

    it("should be able to set & get a value on different instances simultaneously", async function () {
      // this.slow(600)
      // this.timeout(5000)

      const cache1 = create({ path: cacheDirectory });
      const cache2 = create({ path: cacheDirectory });
      const cache3 = create({ path: cacheDirectory });

      const value1 = {
        int: 5,
        bool: true,
        float: Math.random(),
        buffer: Buffer.from("Hello World1!"),
        string: '#äö=)@€²(/&%$§"1',
        largeBuffer: Buffer.alloc(1),
      };
      const value2 = {
        int: 6,
        bool: true,
        float: Math.random(),
        buffer: Buffer.from("Hello World2!"),
        string: '#äö=)@€²(/&%$§"2',
        largeBuffer: Buffer.alloc(2),
      };
      const value3 = {
        int: 7,
        bool: true,
        float: Math.random(),
        buffer: Buffer.from("Hello World3!"),
        string: '#äö=)@€²(/&%$§"3',
        largeBuffer: Buffer.alloc(3),
      };

      await Promise.all([
        // @ts-ignore prototype
        cache1.set("key", value1),
        // @ts-ignore prototype
        cache2.set("key", value2),
        // @ts-ignore prototype
        cache3.set("key", value3),
      ]);
      const values = await Promise.all([
        // @ts-ignore prototype
        cache1.get("key"),
        // @ts-ignore prototype
        cache2.get("key"),
        // @ts-ignore prototype
        cache3.get("key"),
      ]);
      // all caches should be the same
      expect(values[0]).toEqual(values[1]);
      expect(values[0]).toEqual(values[2]);

      // the cache should be one of the values that was stored to it
      try {
        expect(values[0]).toEqual(values[1]);
      } catch (e) {
        try {
          expect(values[0]).toEqual(value2);
        } catch (e) {
          expect(values[0]).toEqual(value3);
        }
      }
    });

    it("should work with zip option", async function () {
      const cache = create({ path: cacheDirectory, zip: true });
      const originalValue = {
        int: 5,
        bool: true,
        float: Math.random(),
        buffer: Buffer.from("Hello World1!"),
        string: '#äö=)@€²(/&%$§"1',
        largeBuffer: Buffer.alloc(1),
      };

      // @ts-ignore prototype
      await cache.set("key", originalValue);
      // @ts-ignore prototype
      const loadedValue = await cache.get("key");
      expect(loadedValue).toEqual(originalValue);
    });

    it("should be able to store the number Infinity", async function () {
      const cache = create({ path: cacheDirectory });
      const originalValue = Infinity;
      // @ts-ignore prototype
      await cache.set("key", originalValue);
      // @ts-ignore prototype
      const loadedValue = await cache.get("key");
      expect(loadedValue).toEqual(originalValue);
    });
  });
});
