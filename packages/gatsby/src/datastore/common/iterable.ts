import { IGatsbyIterable } from "../types"

export class GatsbyIterable<T> implements IGatsbyIterable<T> {
  constructor(private source: Iterable<T>) {}

  [Symbol.iterator](): Iterator<T> {
    return this.source[Symbol.iterator]()
  }

  concat<U = T>(other: Iterable<U>): GatsbyIterable<T | U> {
    return new GatsbyIterable(concatSequence(this, other))
  }

  map<U>(fn: (entry: T) => U): GatsbyIterable<U> {
    return new GatsbyIterable(mapSequence(this, fn))
  }

  filter(predicate: (entry: T) => unknown): GatsbyIterable<T> {
    return new GatsbyIterable<T>(filterSequence(this, predicate))
  }

  slice(start: number, end: number) {
    const source = this.source
    return new GatsbyIterable(
      (function* (): Generator<T> {
        let index = 0
        for (const item of source) {
          if (index++ < start) {
            continue
          }
          if (index > end) {
            return
          }
          yield item
        }
      })()
    )
  }

  deduplicate(keyFn?: (entry: T) => unknown): GatsbyIterable<T> {
    return new GatsbyIterable<T>(deduplicate(this, keyFn))
  }

  forEach(callback: (entry: T) => unknown): void {
    for (const value of this) {
      callback(value)
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
    return new GatsbyIterable(mergeSorted(this, other, comparator))
  }

  /**
   * Assuming both this and the other iterable are sorted
   * produces the new sorted iterable with values from this iterable
   * that also exist in the other iterable.
   *
   * Note: this method is not removing duplicates
   */
  intersectSorted<U = T>(
    other: Iterable<U>,
    comparator?: (a: T | U, b: T | U) => number
  ): GatsbyIterable<T | U> {
    return new GatsbyIterable(intersectSorted(this, other, comparator))
  }

  /**
   * Assuming this iterable is sorted, removes duplicates from it
   * by applying isEqual(prev, current) comparator to sibling iterable values.
   *
   * If isEqual comparator is not set, uses strict === comparison
   */
  deduplicateSorted(
    isEqual?: (prev: T, current: T) => boolean
  ): GatsbyIterable<T> {
    return new GatsbyIterable<T>(deduplicateSorted(this, isEqual))
  }
}

function* mapSequence<T, U>(
  source: Iterable<T>,
  fn: (arg: T) => U
): Generator<U> {
  for (const value of source) {
    yield fn(value)
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

function* concatSequence<T, U = T>(
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

function* deduplicate<T>(
  source: Iterable<T>,
  keyFn?: (entry: T) => unknown
): Generator<T> {
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
  isEqual: (prev: T, current: T) => boolean = defaultIsEqual
): Generator<T> {
  let prev
  for (const current of source) {
    if (typeof prev === `undefined` || !isEqual(prev, current)) {
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
}

function* intersectSorted<T, U = T>(
  firstSorted: Iterable<T>,
  secondSorted: Iterable<U>,
  comparator: (a: T | U, b: T | U) => number = defaultComparator
): Generator<T> {
  const iter1 = firstSorted[Symbol.iterator]()
  const iter2 = secondSorted[Symbol.iterator]()
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
}

function defaultComparator<T, U = T>(a: T | U, b: T | U): number {
  if (a === b) {
    return 0
  }
  return a > b ? 1 : -1
}

function defaultIsEqual<T, U = T>(a: T | U, b: T | U): boolean {
  return a === b
}
