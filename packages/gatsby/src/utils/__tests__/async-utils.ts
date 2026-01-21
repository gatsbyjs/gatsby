import { mapSeries, mapWithConcurrency } from "../async-utils"

describe(`async-utils`, () => {
  describe(`mapSeries`, () => {
    it(`executes functions sequentially, not in parallel`, async () => {
      const executionOrder: Array<number> = []
      const items = [1, 2, 3]

      const results = await mapSeries(items, async (item, index) => {
        executionOrder.push(index)
        // Earlier items take longer - if parallel, order would be [2, 1, 0]
        await new Promise(resolve => setTimeout(resolve, (3 - index) * 10))
        return item * 2
      })

      expect(results).toEqual([2, 4, 6])
      expect(executionOrder).toEqual([0, 1, 2])
    })

    it(`preserves order even when later items would finish first`, async () => {
      const completionOrder: Array<number> = []
      const items = [100, 50, 10] // delays in ms

      const results = await mapSeries(items, async (delay, index) => {
        await new Promise(resolve => setTimeout(resolve, delay))
        completionOrder.push(index)
        return `item-${index}`
      })

      // Sequential means completion order matches input order
      expect(completionOrder).toEqual([0, 1, 2])
      expect(results).toEqual([`item-0`, `item-1`, `item-2`])
    })

    it(`handles empty arrays`, async () => {
      const results = await mapSeries([], async (item: number) => item * 2)
      expect(results).toEqual([])
    })

    it(`propagates errors and stops execution`, async () => {
      const executed: Array<number> = []

      await expect(
        mapSeries([1, 2, 3], async item => {
          executed.push(item)
          if (item === 2) {
            throw new Error(`Error on item 2`)
          }
          return item
        })
      ).rejects.toThrow(`Error on item 2`)

      // Should have executed items 1 and 2, but not 3
      expect(executed).toEqual([1, 2])
    })

    it(`works with iterables (not just arrays)`, async () => {
      const set = new Set([1, 2, 3])
      const results = await mapSeries(set, async item => item * 2)
      expect(results).toEqual([2, 4, 6])
    })
  })

  describe(`mapWithConcurrency`, () => {
    it(`limits concurrent executions to specified concurrency`, async () => {
      let currentlyRunning = 0
      let maxConcurrent = 0
      const concurrency = 2
      const items = [1, 2, 3, 4, 5]

      await mapWithConcurrency(
        items,
        async () => {
          currentlyRunning++
          maxConcurrent = Math.max(maxConcurrent, currentlyRunning)
          await new Promise(resolve => setTimeout(resolve, 20))
          currentlyRunning--
          return null
        },
        concurrency
      )

      // Should never exceed concurrency limit
      expect(maxConcurrent).toBeLessThanOrEqual(concurrency)
      // Should actually use concurrency (not just run 1 at a time)
      expect(maxConcurrent).toBeGreaterThan(1)
    })

    it(`processes all items and returns results in input order`, async () => {
      const items = [1, 2, 3, 4, 5]

      const results = await mapWithConcurrency(
        items,
        async item => {
          // Random delay to test ordering
          await new Promise(resolve => setTimeout(resolve, Math.random() * 10))
          return item * 2
        },
        2
      )

      // Results should be in the same order as input, not completion order
      expect(results).toEqual([2, 4, 6, 8, 10])
    })

    it(`handles empty arrays`, async () => {
      const results = await mapWithConcurrency(
        [],
        async (item: number) => item * 2,
        2
      )
      expect(results).toEqual([])
    })

    it(`propagates errors`, async () => {
      await expect(
        mapWithConcurrency(
          [1, 2, 3],
          async item => {
            await new Promise(resolve => setTimeout(resolve, 5))
            if (item === 2) {
              throw new Error(`Error on item 2`)
            }
            return item
          },
          1
        )
      ).rejects.toThrow(`Error on item 2`)
    })

    it(`with concurrency 1 processes items one at a time`, async () => {
      let currentlyRunning = 0
      let maxConcurrent = 0
      const items = [1, 2, 3]

      await mapWithConcurrency(
        items,
        async () => {
          currentlyRunning++
          maxConcurrent = Math.max(maxConcurrent, currentlyRunning)
          await new Promise(resolve => setTimeout(resolve, 5))
          currentlyRunning--
          return null
        },
        1
      )

      expect(maxConcurrent).toBe(1)
    })

    it(`processes all items even with high concurrency`, async () => {
      const items = [1, 2, 3, 4, 5]
      const processed: Array<number> = []

      await mapWithConcurrency(
        items,
        async item => {
          processed.push(item)
          return item
        },
        10 // Higher than array length
      )

      expect(processed.sort()).toEqual([1, 2, 3, 4, 5])
    })
  })
})
