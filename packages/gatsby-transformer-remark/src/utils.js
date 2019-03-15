/**
 * @template T
 * @param {Array<T>} input
 * @param {(input: T) => Promise<void>} iterator
 * @return Promise<void>
 */
exports.eachPromise = (input, iterator) =>
  input.reduce(
    (accumulatorPromise, nextValue) =>
      accumulatorPromise.then(() => iterator(nextValue)),
    Promise.resolve()
  )
