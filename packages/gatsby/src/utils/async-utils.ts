/**
 * Native async utilities to replace bluebird.
 * These provide the same behavior as bluebird's mapSeries and map with concurrency.
 */

/**
 * Execute an async function on each item in an array sequentially.
 * Each item is processed one at a time, in order, waiting for completion before starting the next.
 *
 * Equivalent to Bluebird.mapSeries
 *
 * @param items - Array of items to process
 * @param fn - Async function to call for each item
 * @returns Promise resolving to array of results in the same order as input
 */
export async function mapSeries<T, R>(
  items: Iterable<T>,
  fn: (item: T, index: number) => Promise<R>
): Promise<Array<R>> {
  const results: Array<R> = []
  let index = 0
  for (const item of items) {
    results.push(await fn(item, index))
    index++
  }
  return results
}

/**
 * Execute an async function on each item in an array with limited concurrency.
 * Items are processed in parallel but with a maximum number of concurrent operations.
 * Results are returned in the same order as the input array.
 *
 * Equivalent to Bluebird.map with { concurrency } option
 *
 * @param items - Array of items to process
 * @param fn - Async function to call for each item
 * @param concurrency - Maximum number of concurrent operations
 * @returns Promise resolving to array of results in the same order as input
 */
export async function mapWithConcurrency<T, R>(
  items: Array<T>,
  fn: (item: T, index: number) => Promise<R>,
  concurrency: number
): Promise<Array<R>> {
  if (items.length === 0) {
    return []
  }

  // Results array to maintain order
  const results: Array<R> = new Array(items.length)

  // Track running promises and their indices
  const running: Set<Promise<void>> = new Set()
  let nextIndex = 0
  let firstError: Error | undefined

  // Process items with concurrency limit
  const processNext = async (): Promise<void> => {
    while (nextIndex < items.length && !firstError) {
      // Wait if at concurrency limit
      if (running.size >= concurrency) {
        await Promise.race(running)
        continue
      }

      const index = nextIndex++
      const item = items[index]

      const promise = (async (): Promise<void> => {
        try {
          results[index] = await fn(item, index)
        } catch (error) {
          if (!firstError) {
            firstError = error as Error
          }
        }
      })()

      running.add(promise)
      promise.finally(() => running.delete(promise))
    }
  }

  // Start processing
  await processNext()

  // Wait for all running promises to complete
  await Promise.all(running)

  // Throw if there was an error
  if (firstError) {
    throw firstError
  }

  return results
}
