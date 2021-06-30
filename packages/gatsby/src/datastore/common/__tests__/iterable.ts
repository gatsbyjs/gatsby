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

  it(`returns other GatsbyIterable`, () => {
    const foo = new GatsbyIterable([`foo`])
    const result = foo.concat([`bar`])
    expect(result).toBeInstanceOf(GatsbyIterable)
  })
})

describe(`GatsbyIterable.map`, () => {
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

  it(`returns other GatsbyIterable`, () => {
    const foo = new GatsbyIterable([1])
    const result = foo.map(item => item + 1)
    expect(result).toBeInstanceOf(GatsbyIterable)
  })
})

describe(`GatsbyIterable.flatMap`, () => {
  it(`applies mapper function`, () => {
    const foo = new GatsbyIterable([1, 2, 3])
    const mapped = foo.flatMap(item => new GatsbyIterable([item, item + 1]))
    expect(Array.from(mapped)).toEqual([1, 2, 2, 3, 3, 4])
  })

  it(`flattens other iterables`, () => {
    const foo = new GatsbyIterable([1, 2, 3])
    const mapped = foo.flatMap(item => new Set([item, item + 1]))
    expect(Array.from(mapped)).toEqual([1, 2, 2, 3, 3, 4])
  })

  it(`supports index argument in mapper function`, () => {
    const foo = new GatsbyIterable([`foo`, `bar`, `baz`])
    const mapped = foo.flatMap((_, index) => index)
    expect(Array.from(mapped)).toEqual([0, 1, 2])
  })

  it(`flattens one level deep`, () => {
    const foo = new GatsbyIterable([1, 2, 3])
    const mapped = foo.flatMap(item => new Set([item, new Set([item + 1])]))
    expect(Array.from(mapped)).toEqual([
      1,
      new Set([2]),
      2,
      new Set([3]),
      3,
      new Set([4]),
    ])
  })

  it(`does not flatten arrays - only other iterables`, () => {
    const foo = new GatsbyIterable([1, 2, 3])
    const mapped = foo.flatMap(item => [item, item + 1])
    expect(Array.from(mapped)).toEqual([
      [1, 2],
      [2, 3],
      [3, 4],
    ])
  })

  it(`does not support 3rd argument (full iterable) in mapper function`, () => {
    const foo = new GatsbyIterable([`foo`, `bar`])
    const mapper: any = (_, __, nope) => nope
    const mapped = foo.flatMap(mapper)
    expect(Array.from(mapped)).toEqual([undefined, undefined])
  })

  it(`is lazy`, () => {
    const fn = jest.fn()
    fn.mockImplementation(item => new Set([item + 1]))

    const foo = new GatsbyIterable([1, 2, 3])
    const mapped = foo.flatMap(fn)
    expect(fn.mock.calls.length).toEqual(0)

    let i = 0
    // @ts-ignore
    for (const _ of mapped) {
      expect(fn.mock.calls.length).toEqual(++i)
    }
  })

  it(`returns other GatsbyIterable`, () => {
    const foo = new GatsbyIterable([1])
    const result = foo.flatMap(item => item + 1)
    expect(result).toBeInstanceOf(GatsbyIterable)
  })
})

describe(`GatsbyIterable.filter`, () => {
  it(`applies predicate`, () => {
    const foo = new GatsbyIterable([1, 2, 3])
    const odd = foo.filter(item => item % 2 === 1)
    expect(Array.from(odd)).toEqual([1, 3])
  })

  it(`is lazy`, () => {
    const fn = jest.fn()
    fn.mockImplementation(item => item % 2 === 0)

    const foo = new GatsbyIterable([1, 2, 3, 4])
    const even = foo.flatMap(fn)
    expect(fn.mock.calls.length).toEqual(0)

    let i = 0
    // @ts-ignore
    for (const _ of even) {
      expect(fn.mock.calls.length).toEqual(++i)
    }
  })

  it(`returns other GatsbyIterable`, () => {
    const foo = new GatsbyIterable([1, 2, 3])
    const result = foo.filter(item => item % 2 === 0)
    expect(result).toBeInstanceOf(GatsbyIterable)
  })
})

describe(`GatsbyIterable.slice`, () => {
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

  it(`returns other GatsbyIterable`, () => {
    const foo = new GatsbyIterable([1, 2, 3, 4])
    const result = foo.slice(1, 3)
    expect(result).toBeInstanceOf(GatsbyIterable)
  })
})
