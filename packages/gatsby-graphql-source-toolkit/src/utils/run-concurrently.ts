import { chunk } from "lodash"

export type AsyncThunk<T> = () => Promise<T>

/**
 * Async generator that executes thunks with defined concurrency.
 *
 * Example:
 * ```
 * const thunks = [
 *   () => promise1,
 *   () => promise2,
 *   () => promise3,
 * ]
 *
 * for await (const result of runConcurrently(thunks, 2)) {
 *   console.log(result)
 * }
 * ```
 * This code will NOT call `() => promise3` until the first two promises
 * are resolved and yielded
 */
export async function* runConcurrently<T>(
  thunks: AsyncThunk<T>[],
  concurrency: number
): AsyncIterable<T> {
  // TODO: start the next task as soon as the previous ends vs running in chunks?
  //   also consider binding this with query batching
  const taskChunks: AsyncThunk<T>[][] = chunk(thunks, concurrency)

  for (const taskChunk of taskChunks) {
    const results = await Promise.all(taskChunk.map(task => task()))
    for (const taskResult of results) {
      yield taskResult
    }
  }
}
