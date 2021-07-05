import { GatsbyIterable } from "../iterable"

describe(`GatsbyIterable.constructor`, () => {
  it(`supports arrays`, () => {
    const arr = [`foo`, `bar`, `baz`]
    const iterable = new GatsbyIterable(arr)
    expect(Array.from(iterable)).toEqual([`foo`, `bar`, `baz`])
  })

  it(`supports array thunks`, () => {
    const arrThunk = (): Array<string> => [`foo`, `bar`, `baz`]
    const iterable = new GatsbyIterable(arrThunk)
    expect(Array.from(iterable)).toEqual([`foo`, `bar`, `baz`])
  })

  it(`supports other iterables`, () => {
    const set = new Set([`foo`, `bar`, `baz`])
    const iterable = new GatsbyIterable(set)
    expect(Array.from(iterable)).toEqual([`foo`, `bar`, `baz`])
  })

  it(`supports iterable thunks`, () => {
    const mapThunk = (): Map<string, number> =>
      new Map([
        [`foo`, 1],
        [`bar`, 2],
        [`baz`, 3],
      ])
    const iterable = new GatsbyIterable(mapThunk)
    expect(Array.from(iterable)).toEqual([
      [`foo`, 1],
      [`bar`, 2],
      [`baz`, 3],
    ])
  })

  it(`supports generators`, () => {
    function* gen(): Generator<string> {
      yield `foo`
      yield `bar`
      yield `baz`
    }
    const iterable = new GatsbyIterable(gen())
    expect(Array.from(iterable)).toEqual([`foo`, `bar`, `baz`])
  })

  it(`supports generator thunks`, () => {
    function* gen(): Generator<string> {
      yield `foo`
      yield `bar`
      yield `baz`
    }
    const iterable = new GatsbyIterable(() => gen())
    expect(Array.from(iterable)).toEqual([`foo`, `bar`, `baz`])
  })
})

describe(`GatsbyIterable.concat`, () => {
  it(`returns other GatsbyIterable`, () => {
    const foo = new GatsbyIterable([`foo`])
    const result = foo.concat([`bar`])
    expect(result).toBeInstanceOf(GatsbyIterable)
  })

  it(`supports array`, () => {
    const foo = new GatsbyIterable([`foo`, `bar`])
    const result = foo.concat([`baz`])
    expect(Array.from(result)).toEqual([`foo`, `bar`, `baz`])
  })

  it(`supports empty array`, () => {
    const foo = new GatsbyIterable([`foo`, `bar`])
    const result = foo.concat([])
    expect(Array.from(result)).toEqual([`foo`, `bar`])
  })

  it(`supports other iterable`, () => {
    const foo = new GatsbyIterable([`foo`, `bar`])
    const result = foo.concat(new Set([`baz`]))
    expect(Array.from(result)).toEqual([`foo`, `bar`, `baz`])
  })

  it(`supports generator`, () => {
    function* gen(): Generator<string> {
      yield `bar`
      yield `baz`
    }
    const foo = new GatsbyIterable([`foo`])
    const result = foo.concat(gen())
    expect(Array.from(result)).toEqual([`foo`, `bar`, `baz`])
  })
})

describe(`GatsbyIterable.map`, () => {
  it(`returns other GatsbyIterable`, () => {
    const foo = new GatsbyIterable([1])
    const result = foo.map(item => item + 1)
    expect(result).toBeInstanceOf(GatsbyIterable)
  })

  it(`applies mapper function`, () => {
    const foo = new GatsbyIterable([1, 2, 3])
    const mapped = foo.map(item => item + 1)
    expect(Array.from(mapped)).toEqual([2, 3, 4])
  })

  it(`supports index argument in mapper function`, () => {
    const foo = new GatsbyIterable([`foo`, `bar`, `baz`])
    const mapped = foo.map((_, index) => index)
    expect(Array.from(mapped)).toEqual([0, 1, 2])
  })

  it(`does not support 3rd argument (full iterable) in mapper function`, () => {
    const foo = new GatsbyIterable([`foo`, `bar`])
    const mapper: any = (_, __, nope) => nope
    const mapped = foo.map(mapper)
    expect(Array.from(mapped)).toEqual([undefined, undefined])
  })

  it(`is lazy`, () => {
    const fn = jest.fn()
    fn.mockImplementation(item => item + 1)

    const foo = new GatsbyIterable([1, 2, 3])
    const mapped = foo.map(fn)
    expect(fn.mock.calls.length).toEqual(0)

    let i = 0
    // @ts-ignore
    for (const _ of mapped) {
      expect(fn.mock.calls.length).toEqual(++i)
    }
  })
})

describe(`GatsbyIterable.filter`, () => {
  it(`returns other GatsbyIterable`, () => {
    const foo = new GatsbyIterable([1, 2, 3])
    const result = foo.filter(item => item % 2 === 0)
    expect(result).toBeInstanceOf(GatsbyIterable)
  })

  it(`applies predicate`, () => {
    const foo = new GatsbyIterable([1, 2, 3])
    const odd = foo.filter(item => item % 2 === 1)
    expect(Array.from(odd)).toEqual([1, 3])
  })

  it(`is lazy`, () => {
    const fn = jest.fn()
    fn.mockImplementation(item => item % 2 === 0)

    const foo = new GatsbyIterable([1, 2, 3, 4])
    const even = foo.filter(fn)
    expect(fn.mock.calls.length).toEqual(0)

    let i = 0
    // @ts-ignore
    for (const _ of even) {
      expect(fn.mock.calls.length).toEqual((i += 2))
    }
  })
})

describe(`GatsbyIterable.slice`, () => {
  it(`returns other GatsbyIterable`, () => {
    const foo = new GatsbyIterable([1, 2, 3, 4])
    const result = foo.slice(1, 3)
    expect(result).toBeInstanceOf(GatsbyIterable)
  })

  it(`supports start and end arguments`, () => {
    const foo = new GatsbyIterable([1, 2, 3, 4])
    const slice = foo.slice(1, 3)
    expect(Array.from(slice)).toEqual([2, 3])
  })

  it(`works with start argument only`, () => {
    const foo = new GatsbyIterable([1, 2, 3, 4])
    const slice = foo.slice(1, undefined)
    expect(Array.from(slice)).toEqual([2, 3, 4])
  })

  it(`throws when start > end`, () => {
    const foo = new GatsbyIterable([1, 2, 3, 4])
    expect(() => foo.slice(3, 1)).toThrow(
      `Both arguments must not be negative and end must be greater than start`
    )
  })

  it(`returns empty iterable when start === end`, () => {
    const foo = new GatsbyIterable([1, 2, 3, 4])
    const slice = foo.slice(1, 1)
    expect(Array.from(slice)).toEqual([])
  })

  it(`slices other iterables`, () => {
    const foo = new GatsbyIterable(new Set([1, 2, 3, 4]))
    const slice = foo.slice(1, 3)
    expect(Array.from(slice)).toEqual([2, 3])
  })

  it(`slices generators`, () => {
    function* gen(): Generator<number> {
      yield 1
      yield 2
      yield 3
      yield 4
    }
    const foo = new GatsbyIterable(gen())
    const slice = foo.slice(1, 3)
    expect(Array.from(slice)).toEqual([2, 3])
  })
})

describe(`GatsbyIterable.deduplicate`, () => {
  it(`returns other GatsbyIterable`, () => {
    const foo = new GatsbyIterable([1, 2, 3, 1])
    const result = foo.deduplicate()
    expect(result).toBeInstanceOf(GatsbyIterable)
  })

  it(`deduplicates numbers`, () => {
    const foo = new GatsbyIterable([1, 2, 3, 1])
    const result = foo.deduplicate()
    expect(Array.from(result)).toEqual([1, 2, 3])
  })

  it(`deduplicates strings`, () => {
    const foo = new GatsbyIterable([`foo`, `bar`, `baz`, `bar`])
    const result = foo.deduplicate()
    expect(Array.from(result)).toEqual([`foo`, `bar`, `baz`])
  })

  it(`uses strict equality to deduplicate values by default`, () => {
    const foo = { foo: 1 }
    const bar = { bar: 1 }
    const baz = { baz: 1 }
    const foo2 = { foo: 1 }

    const iterable = new GatsbyIterable([
      foo,
      bar,
      bar,
      foo,
      baz,
      bar,
      foo,
      foo2,
    ])
    const unique = iterable.deduplicate()
    expect(Array.from(unique)).toEqual([foo, bar, baz, foo2])
  })

  it(`supports custom key function`, () => {
    const foo = { foo: 1 }
    const bar = { bar: 1 }
    const baz = { baz: 1 }
    const foo2 = { foo: 1 }
    const iterable = new GatsbyIterable([
      foo,
      bar,
      bar,
      foo,
      baz,
      bar,
      foo,
      foo2,
    ])
    const unique = iterable.deduplicate(
      (value): string => Object.keys(value)[0]
    )
    expect(Array.from(unique)).toEqual([foo, bar, baz])
  })

  it(`is lazy`, () => {
    const fn = jest.fn()
    fn.mockImplementation(item => item)

    const iterable = new GatsbyIterable([1, 2, 3, 1])
    const unique = iterable.deduplicate(fn)
    expect(fn.mock.calls.length).toEqual(0)

    let i = 0
    // @ts-ignore
    for (const _ of unique) {
      expect(fn.mock.calls.length).toEqual(++i)
    }
  })
})

describe(`GatsbyIterable.forEach`, () => {
  it(`is eager`, () => {
    let isCalled = false
    const foo = new GatsbyIterable([1, 2, 3])
    foo.forEach(() => {
      isCalled = true
    })
    expect(isCalled).toEqual(true)
  })

  it(`applies callback function`, () => {
    const foo = new GatsbyIterable([1, 2, 3])
    let i = 1
    foo.forEach(value => {
      expect(value).toEqual(i++)
    })
    expect(i).toEqual(4)
  })

  it(`supports index argument in callback function`, () => {
    const iterable = new GatsbyIterable([`foo`, `bar`, `baz`])
    let i = 0
    iterable.forEach((_, index) => {
      expect(i++).toEqual(index)
    })
    expect(i).toEqual(3)
  })
})

describe(`GatsbyIterable.mergeSorted`, () => {
  it(`returns other GatsbyIterable`, () => {
    const foo = new GatsbyIterable([`foo`])
    const result = foo.mergeSorted([`bar`])
    expect(result).toBeInstanceOf(GatsbyIterable)
  })

  it(`uses standard JS comparison for numbers by default`, () => {
    const foo = new GatsbyIterable([10, 20, 30, 40])
    const bar = foo.mergeSorted([25, 40.1])
    expect(Array.from(bar)).toEqual([10, 20, 25, 30, 40, 40.1])
  })

  it(`uses standard JS comparison for strings by default`, () => {
    const foo = new GatsbyIterable([`10`, `20`, `30`, `40`])
    const bar = foo.mergeSorted([`25`, `4`])
    expect(Array.from(bar)).toEqual([`10`, `20`, `25`, `30`, `4`, `40`])
  })

  it(`supports custom comparator function`, () => {
    const a = { foo: 10 }
    const b = { foo: 20 }
    const c = { foo: 30 }
    const d = { foo: 40 }

    const comparatorFn = (a, b): number => {
      if (a.foo === b.foo) return 0
      return a.foo > b.foo ? 1 : -1
    }

    const foo = new GatsbyIterable([a, c])
    const result = foo.mergeSorted([b, c, d], comparatorFn)
    expect(Array.from(result)).toEqual([a, b, c, c, d])
  })

  it(`assumes sorted iterables (does not enforce or checks it)`, () => {
    const foo = new GatsbyIterable([30, 10, 20])
    const result = foo.mergeSorted([10, 25])
    expect(Array.from(result)).toEqual([10, 25, 30, 10, 20])
  })

  it(`merges in O(N+M)`, () => {
    const onFooNext = jest.fn()
    const onBarNext = jest.fn()
    const foo = new GatsbyIterable(createSeq(0, onFooNext))
    const bar = foo.mergeSorted(createSeq(0, onBarNext))

    let i = 0
    // @ts-ignore
    for (const _ of bar) {
      if (i === 100) {
        break
      }
      i++
    }
    expect(onFooNext.mock.calls.length).toEqual(51)
    expect(onBarNext.mock.calls.length).toEqual(51)
  })

  it(`closes wrapped iterator on early exit`, () => {
    let closed1 = false
    let closed2 = false
    const foo = new GatsbyIterable(
      createSeq(0, undefined, () => (closed1 = true))
    )
    const bar = foo.mergeSorted(createSeq(1, undefined, () => (closed2 = true)))
    expect(closed1).toEqual(false)
    expect(closed2).toEqual(false)

    let i = 0
    const result = []
    // @ts-ignore
    for (const value of bar) {
      if (i++ >= 5) {
        // Early exit from our iterator must close the other iterator as well
        break
      }
      result.push(value)
    }
    expect(closed1).toEqual(true)
    expect(closed2).toEqual(true)
    expect(i).toEqual(6)
    expect(result).toEqual([0, 1, 10, 11, 20])
  })

  it(`closes wrapped iterator on error`, () => {
    let closed1 = false
    let closed2 = false
    const foo = new GatsbyIterable(
      createSeq(0, undefined, () => (closed1 = true))
    )
    const bar = foo.mergeSorted(createSeq(1, undefined, () => (closed2 = true)))
    expect(closed1).toEqual(false)
    expect(closed2).toEqual(false)

    let i = 0
    const result = []
    try {
      // @ts-ignore
      for (const value of bar) {
        if (i++ >= 5) {
          // Error in our iterator must close the other iterator as well
          throw new Error(`Throw error`)
        }
        result.push(value)
      }
    } catch (e) {
      // no-op
    }
    expect(closed1).toEqual(true)
    expect(closed2).toEqual(true)
    expect(i).toEqual(6)
    expect(result).toEqual([0, 1, 10, 11, 20])
  })

  it(`is lazy`, () => {
    const fn = jest.fn()
    fn.mockImplementation((a, b) => {
      if (a === b) return 0
      return a > b ? 1 : -1
    })

    const foo = new GatsbyIterable([10, 20])
    const bar = foo.mergeSorted([15, 30], fn)

    expect(fn.mock.calls.length).toEqual(0)
    let i = 0
    // @ts-ignore
    for (const _ of bar) i++
    expect(i).toEqual(4)
    expect(fn.mock.calls.length).toEqual(3)
  })
})

describe(`GatsbyIterable.intersectSorted`, () => {
  it(`returns other GatsbyIterable`, () => {
    const foo = new GatsbyIterable([1, 2, 3, 4, 9])
    const bar = foo.intersectSorted([3, 5, 7, 9])
    expect(bar).toBeInstanceOf(GatsbyIterable)
  })

  it(`uses standard JS comparison for numbers by default`, () => {
    const foo = new GatsbyIterable([1, 2, 3, 4, 9])
    const bar = foo.intersectSorted([3, 5, 7, 9])
    expect(Array.from(bar)).toEqual([3, 9])
  })

  it(`returns empty result if one iterable is empty`, () => {
    const foo = new GatsbyIterable([1, 2, 3, 4, 9])
    const bar = foo.intersectSorted([])
    expect(Array.from(bar)).toEqual([])
  })

  it(`returns empty result if there is no intersection`, () => {
    const foo = new GatsbyIterable([1, 3, 5])
    const bar = foo.intersectSorted([0, 2, 4])
    expect(Array.from(bar)).toEqual([])
  })

  it(`uses standard JS comparison for strings by default`, () => {
    const foo = new GatsbyIterable([`10`, `20`, `30`, `40`, `90`])
    const bar = foo.intersectSorted([`30`, `5`, `7`, `90`])
    expect(Array.from(bar)).toEqual([`30`, `90`])
  })

  it(`supports custom comparator function`, () => {
    const a = { foo: 10 }
    const b = { foo: 20 }
    const c = { foo: 30 }
    const d = { foo: 40 }

    const comparatorFn = (a, b): number => {
      if (a.foo === b.foo) return 0
      return a.foo > b.foo ? 1 : -1
    }

    const foo = new GatsbyIterable([a, b, c])
    const result = foo.intersectSorted([b, c, d], comparatorFn)
    expect(Array.from(result)).toEqual([b, c])
  })

  it(`assumes sorted iterables (does not enforce or checks it)`, () => {
    const foo = new GatsbyIterable([30, 10, 20])
    const result = foo.intersectSorted([10, 20])
    expect(Array.from(result)).toEqual([])
  })

  it(`intersects in O(N+M)`, () => {
    const onFooNext = jest.fn()
    const onBarNext = jest.fn()
    const foo = new GatsbyIterable(createSeq(0, onFooNext))
    const bar = foo.intersectSorted(createSeq(0, onBarNext))

    let i = 0
    // @ts-ignore
    for (const _ of bar) {
      if (i === 50) {
        break
      }
      i++
    }
    expect(onFooNext.mock.calls.length).toEqual(51)
    expect(onBarNext.mock.calls.length).toEqual(51)
  })

  it(`closes wrapped iterator on early exit`, () => {
    let closed1 = false
    let closed2 = false
    const foo = new GatsbyIterable(
      createSeq(0, undefined, () => (closed1 = true))
    )
    const bar = foo.intersectSorted(
      createSeq(0, undefined, () => (closed2 = true))
    )
    expect(closed1).toEqual(false)
    expect(closed2).toEqual(false)

    let i = 0
    const result = []
    // @ts-ignore
    for (const value of bar) {
      if (i++ >= 5) {
        // Early exit from our iterator must close the other iterator as well
        break
      }
      result.push(value)
    }
    expect(closed1).toEqual(true)
    expect(closed2).toEqual(true)
    expect(i).toEqual(6)
    expect(result).toEqual([0, 10, 20, 30, 40])
  })

  it(`closes wrapped iterator on error`, () => {
    let closed1 = false
    let closed2 = false
    const foo = new GatsbyIterable(
      createSeq(0, undefined, () => (closed1 = true))
    )
    const bar = foo.intersectSorted(
      createSeq(0, undefined, () => (closed2 = true))
    )
    expect(closed1).toEqual(false)
    expect(closed2).toEqual(false)

    let i = 0
    const result = []
    try {
      // @ts-ignore
      for (const value of bar) {
        if (i++ >= 5) {
          // Error in our iterator must close the other iterator as well
          throw new Error(`Throw error`)
        }
        result.push(value)
      }
    } catch (e) {
      // no-op
    }
    expect(closed1).toEqual(true)
    expect(closed2).toEqual(true)
    expect(i).toEqual(6)
    expect(result).toEqual([0, 10, 20, 30, 40])
  })

  it(`is lazy`, () => {
    const fn = jest.fn()
    fn.mockImplementation((a, b) => {
      if (a === b) return 0
      return a > b ? 1 : -1
    })

    const foo = new GatsbyIterable([10, 20, 30, 40])
    const bar = foo.intersectSorted([20, 30], fn)

    expect(fn.mock.calls.length).toEqual(0)
    let i = 0
    // @ts-ignore
    for (const _ of bar) i++
    expect(i).toEqual(2)
    expect(fn.mock.calls.length).toEqual(5)
  })
})

describe(`GatsbyIterable.deduplicateSorted`, () => {
  it(`returns other GatsbyIterable`, () => {
    const foo = new GatsbyIterable([1, 2, 2, 3])
    const result = foo.deduplicateSorted()
    expect(result).toBeInstanceOf(GatsbyIterable)
  })

  it(`deduplicates numbers`, () => {
    const foo = new GatsbyIterable([1, 2, 2, 3])
    const result = foo.deduplicateSorted()
    expect(Array.from(result)).toEqual([1, 2, 3])
  })

  it(`deduplicates strings`, () => {
    const foo = new GatsbyIterable([`bar`, `baz`, `baz`, `foo`])
    const result = foo.deduplicateSorted()
    expect(Array.from(result)).toEqual([`bar`, `baz`, `foo`])
  })

  it(`supports custom comparator function`, () => {
    const bar = { bar: 1 }
    const baz = { baz: 1 }
    const baz2 = { baz: 2 }
    const foo = { foo: 1 }
    const foo2 = { foo: 2 }
    const iterable = new GatsbyIterable([bar, baz, baz2, foo, foo2])
    const unique = iterable.deduplicateSorted((a, b): number => {
      const [aKey] = Object.keys(a)
      const [bKey] = Object.keys(b)
      if (aKey === bKey) return 0
      return aKey > bKey ? 1 : -1
    })
    expect(Array.from(unique)).toEqual([bar, baz, foo])
  })

  it(`is lazy`, () => {
    const fn = jest.fn()
    fn.mockImplementation((a, b) => {
      if (a === b) return 0
      return a > b ? 1 : -1
    })

    const iterable = new GatsbyIterable([1, 2, 2, 3])
    const unique = iterable.deduplicateSorted(fn)
    expect(fn.mock.calls.length).toEqual(0)

    let i = 0
    // @ts-ignore
    for (const value of unique) {
      if (value === 1) {
        expect(fn.mock.calls.length).toEqual(0)
      }
      if (value === 2) {
        expect(fn.mock.calls.length).toEqual(1)
      }
      if (value === 3) {
        expect(fn.mock.calls.length).toEqual(3)
      }
      i++
    }
    expect(i).toEqual(3)
    expect(fn.mock.calls.length).toEqual(3)
  })
})

function createSeq(
  start: number,
  onNext?: () => void,
  onClose?: () => void
): Iterable<number> {
  return {
    [Symbol.iterator](): Iterator<number> {
      let value = start - 10
      return {
        next(): IteratorYieldResult<number> {
          if (onNext) onNext()
          value += 10
          return { done: false, value }
        },
        return(): IteratorReturnResult<number> {
          if (onClose) onClose()
          return { done: true, value }
        },
      }
    },
  }
}
