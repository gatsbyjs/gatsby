import { IGatsbyIterable } from "../types"

export class GatsbyIterable<T> implements IGatsbyIterable<T> {
  constructor(private source: Iterator<T>) {}

  [Symbol.iterator](): Iterator<T> {
    return this.source
  }

  concat<U>(other: Iterable<U>): GatsbyIterable<T | U> {
    return new GatsbyIterable(concatSequence(this, other))
  }

  map<U>(fn: (entry: T) => U): GatsbyIterable<U> {
    return new GatsbyIterable(mapSequence(this, fn))
  }

  filter(predicate: (entry: T) => unknown): GatsbyIterable<T> {
    return new GatsbyIterable<T>(filterSequence(this, predicate))
  }

  forEach(callback: (entry: T) => unknown): void {
    for (const value of this) {
      callback(value)
    }
  }
}

function* mapSequence<T, U>(
  source: Iterable<T>,
  fn: (arg: T) => U
): Iterator<U> {
  for (const value of source) {
    yield fn(value)
  }
}

function* filterSequence<T>(
  source: Iterable<T>,
  predicate: (arg: T) => unknown
): Iterator<T> {
  for (const value of source) {
    if (predicate(value)) {
      yield value
    }
  }
}

function* concatSequence<T, U = T>(
  first: Iterable<T>,
  second: Iterable<U>
): Iterator<U | T> {
  for (const value of first) {
    yield value
  }
  for (const value of second) {
    yield value
  }
}
