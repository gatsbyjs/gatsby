declare module "lmdb" {
  // currently lmdb doesn't have typings for this export
  export function clearKeptObjects(): void
}

import { clearKeptObjects } from "lmdb"
/**
 * Wrapper for any iterable providing chainable interface and convenience methods
 * similar to array.
 *
 * Additionally provides convenience methods for sorted iterables.
 *
 * Note: avoiding async iterables because of perf reasons, see https://github.com/nodejs/node/issues/31979
 * (fortunately lmdb can traverse stuff in sync manner very fast)
 */
export class GatsbyIterable<T> {
  constructor(private source: Iterable<T> | (() => Iterable<T>)) {}

  *[Symbol.iterator](): Iterator<T> {
    const source =
      typeof this.source === `function` ? this.source() : this.source

    let i = 0
    for (const val of source) {
      yield val

      // clearKeptObjects just make it possible for WeakRefs used in any way during current
      // sync execution tick to be garbage collected. It doesn't force GC, just remove
      // internal strong references in V8.
      // see https://github.com/kriszyp/weak-lru-cache/issues/4
      if (++i % 100 === 0) {
        clearKeptObjects()
      }
    }
  }

  concat<U>(other: Iterable<U>): GatsbyIterable<T | U> {
    return new GatsbyIterable(() => concatSequence(this, other))
  }

  map<U>(fn: (entry: T, index: number) => U): GatsbyIterable<U> {
    return new GatsbyIterable(() => mapSequence(this, fn))
  }

  filter(predicate: (entry: T) => unknown): GatsbyIterable<T> {
    return new GatsbyIterable(() => filterSequence(this, predicate))
  }

  slice(start: number, end?: number): GatsbyIterable<T> {
    if ((typeof end !== `undefined` && end < start) || start < 0)
      throw new Error(
        `Both arguments must not be negative and end must be greater than start`
      )
    return new GatsbyIterable<T>(() => sliceSequence(this, start, end))
  }

  deduplicate(keyFn?: (entry: T) => unknown): GatsbyIterable<T> {
    return new GatsbyIterable<T>(() => deduplicateSequence(this, keyFn))
  }

  forEach(callback: (entry: T, index: number) => unknown): void {
    let i = 0
    for (const value of this) {
      callback(value, i++)
    }
  }

  /**
   * Assuming both this and the other iterable are sorted
   * produces the new sorted iterable with interleaved values.
   *
   * Note: this method is not removing duplicates
   */
  mergeSorted<U = T>(
    other: Iterable<U>,
    comparator?: (a: T | U, b: T | U) => number
  ): GatsbyIterable<T | U> {
    return new GatsbyIterable(() => mergeSorted(this, other, comparator))
  }

  /**
   * Assuming both this and the other iterable are sorted
   * produces the new sorted iterable with values from this iterable
   * that also exist in the other iterable.
   */
  intersectSorted<U = T>(
    other: Iterable<U>,
    comparator?: (a: T | U, b: T | U) => number
  ): GatsbyIterable<T | U> {
    return new GatsbyIterable(() => intersectSorted(this, other, comparator))
  }

  /**
   * Assuming this iterable is sorted, removes duplicates from it
   * by applying comparator(prev, current) to sibling iterable values.
   *
   * Comparator function is expected to return 0 when items are equal,
   * similar to Array.prototype.sort() argument.
   *
   * If comparator is not set, uses strict === comparison
   */
  deduplicateSorted(comparator?: (a: T, b: T) => number): GatsbyIterable<T> {
    return new GatsbyIterable<T>(() => deduplicateSorted(this, comparator))
  }
}

/**
 * Returns true when passed value is iterable
 */
export function isIterable(obj: unknown): obj is Iterable<any> {
  if (typeof obj !== `object` || obj === null) {
    return false
  }
  return typeof obj[Symbol.iterator] === `function`
}

export function isNonArrayIterable<T>(value: unknown): value is Iterable<T> {
  return isIterable(value) && !Array.isArray(value)
}

function* mapSequence<T, U>(
  source: Iterable<T>,
  fn: (arg: T, index: number) => U
): Generator<U> {
  let i = 0
  for (const value of source) {
    yield fn(value, i++)
  }
}

function* sliceSequence<T>(
  source: Iterable<T>,
  start: number,
  end: number | undefined
): Generator<T> {
  let index = -1
  for (const item of source) {
    index++
    if (index < start) continue
    if (typeof end !== `undefined` && index >= end) break
    yield item
  }
}

function* filterSequence<T>(
  source: Iterable<T>,
  predicate: (arg: T) => unknown
): Generator<T> {
  for (const value of source) {
    if (predicate(value)) {
      yield value
    }
  }
}

function* concatSequence<T, U>(
  first: Iterable<T>,
  second: Iterable<U>
): Generator<U | T> {
  for (const value of first) {
    yield value
  }
  for (const value of second) {
    yield value
  }
}

function* deduplicateSequence<T>(
  source: Iterable<T>,
  keyFn?: (entry: T) => unknown
): Generator<T> {
  // TODO: this can be potentially improved by using bloom filters?
  const registered = new Set<unknown>()

  for (const current of source) {
    const key = keyFn ? keyFn(current) : current
    if (!registered.has(key)) {
      registered.add(key)
      yield current
    }
  }
}

function* deduplicateSorted<T>(
  source: Iterable<T>,
  comparator: (a: T, b: T) => number = defaultComparator
): Generator<T> {
  let prev
  for (const current of source) {
    if (typeof prev === `undefined` || comparator(prev, current) !== 0) {
      yield current
    }
    prev = current
  }
}

// Merge two originally sorted iterables:
function* mergeSorted<T, U = T>(
  firstSorted: Iterable<T>,
  secondSorted: Iterable<U>,
  comparator: (a: T | U, b: T | U) => number = defaultComparator
): Generator<T | U> {
  const iter1 = firstSorted[Symbol.iterator]()
  const iter2 = secondSorted[Symbol.iterator]()
  try {
    let a = iter1.next()
    let b = iter2.next()
    while (!a.done && !b.done) {
      if (comparator(a.value, b.value) <= 0) {
        yield a.value
        a = iter1.next()
      } else {
        yield b.value
        b = iter2.next()
      }
    }
    while (!a.done) {
      yield a.value
      a = iter1.next()
    }
    while (!b.done) {
      yield b.value
      b = iter2.next()
    }
  } finally {
    // If generator is exited early, make sure to close iterators too
    // See https://raganwald.com/2017/07/22/closing-iterables-is-a-leaky-abstraction.html#more-about-closing-iterators-explicitly
    if (typeof iter1.return === `function`) iter1.return()
    if (typeof iter2.return === `function`) iter2.return()
  }
}

function* intersectSorted<T, U = T>(
  firstSorted: Iterable<T>,
  secondSorted: Iterable<U>,
  comparator: (a: T | U, b: T | U) => number = defaultComparator
): Generator<T> {
  const iter1 = firstSorted[Symbol.iterator]()
  const iter2 = secondSorted[Symbol.iterator]()
  try {
    let a = iter1.next()
    let b = iter2.next()

    while (!a.done && !b.done) {
      const eq = comparator(a.value, b.value)

      if (eq < 0) {
        // a < b
        a = iter1.next()
      } else if (eq > 0) {
        // a > b
        b = iter2.next()
      } else {
        yield a.value
        a = iter1.next()
      }
    }
  } finally {
    if (typeof iter1.return === `function`) iter1.return()
    if (typeof iter2.return === `function`) iter2.return()
  }
}

function defaultComparator<T, U = T>(a: T | U, b: T | U): number {
  if (a === b) {
    return 0
  }
  return a > b ? 1 : -1
}
