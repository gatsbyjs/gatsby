import { store } from "../../../redux"
import { createHeadersMatcher } from "../create-headers"
import type { IHeader } from "../../../redux/types"

jest.mock(`../../../redux`, () => {
  return {
    emitter: {
      on: jest.fn(),
    },
    store: {
      getState: jest.fn(),
    },
  }
})

function mockHeaders(headers: Array<IHeader>): void {
  ;(store.getState as jest.Mock).mockImplementation(() => {
    return {
      config: {
        headers,
      },
    }
  })
}

describe(`createHeadersMatcher`, () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it(`returns default headers if no custom headers are defined`, () => {
    ;(store.getState as jest.Mock).mockImplementation(() => {
      return {
        config: {},
      }
    })

    const matcher = createHeadersMatcher()

    const defaults = [
      {
        key: `x-default-header`,
        value: `win`,
      },
    ]

    const result = matcher(`/some-path/`, defaults)

    expect(result).toEqual(defaults)
  })

  it(`returns default headers if an empty array as headers is defined`, () => {
    ;(store.getState as jest.Mock).mockImplementation(() => {
      return {
        config: {
          headers: [],
        },
      }
    })

    const matcher = createHeadersMatcher()

    const defaults = [
      {
        key: `x-default-header`,
        value: `win`,
      },
    ]

    const result = matcher(`/some-path/`, defaults)

    expect(result).toEqual(defaults)
  })

  it(`gracefully handles trailing slash inconsistencies`, () => {
    mockHeaders([
      {
        source: `/some-path`,
        headers: [
          {
            key: `x-custom-header`,
            value: `win`,
          },
        ],
      },
      {
        source: `/another-path/`,
        headers: [
          {
            key: `x-custom-header`,
            value: `win`,
          },
        ],
      },
    ])
    const matcher = createHeadersMatcher()

    const defaults = []

    const resultOne = matcher(`/some-path/`, defaults)
    const resultTwo = matcher(`/another-path`, defaults)

    expect(resultOne).toEqual([{ key: `x-custom-header`, value: `win` }])
    expect(resultTwo).toEqual([{ key: `x-custom-header`, value: `win` }])
  })

  it(`combines with non-overlapping keys`, () => {
    mockHeaders([
      {
        source: `*`,
        headers: [
          {
            key: `x-another-custom-header`,
            value: `win`,
          },
        ],
      },
      {
        source: `/some-path/`,
        headers: [
          {
            key: `x-custom-header`,
            value: `win`,
          },
        ],
      },
    ])
    const matcher = createHeadersMatcher()

    const defaults = [
      {
        key: `x-default-header`,
        value: `win`,
      },
    ]

    const result = matcher(`/some-path/`, defaults)

    expect(result).toEqual([
      ...defaults,
      { key: `x-another-custom-header`, value: `win` },
      { key: `x-custom-header`, value: `win` },
    ])
  })

  it(`combines with overlapping keys`, () => {
    mockHeaders([
      {
        source: `*`,
        headers: [
          {
            key: `x-custom-header`,
            value: `lose-2`,
          },
        ],
      },
      {
        source: `/some-path/`,
        headers: [
          {
            key: `x-custom-header`,
            value: `win`,
          },
        ],
      },
    ])
    const matcher = createHeadersMatcher()

    const defaults = [
      {
        key: `x-custom-header`,
        value: `lose-1`,
      },
    ]

    const result = matcher(`/some-path/`, defaults)

    expect(result).toEqual([{ key: `x-custom-header`, value: `win` }])
  })

  it(`combines with overlapping & non-overlapping keys`, () => {
    mockHeaders([
      {
        source: `*`,
        headers: [
          {
            key: `x-custom-header`,
            value: `lose-2`,
          },
          {
            key: `x-dynamic-header`,
            value: `win`,
          },
        ],
      },
      {
        source: `/some-path/`,
        headers: [
          {
            key: `x-custom-header`,
            value: `win`,
          },
          {
            key: `x-static-header`,
            value: `win`,
          },
        ],
      },
    ])
    const matcher = createHeadersMatcher()

    const defaults = [
      {
        key: `x-custom-header`,
        value: `lose-1`,
      },
      {
        key: `x-default-header`,
        value: `win`,
      },
    ]

    const result = matcher(`/some-path/`, defaults)

    expect(result).toEqual([
      {
        key: `x-custom-header`,
        value: `win`,
      },
      {
        key: `x-default-header`,
        value: `win`,
      },
      {
        key: `x-dynamic-header`,
        value: `win`,
      },
      {
        key: `x-static-header`,
        value: `win`,
      },
    ])
  })

  it(`static wins over dynamic`, () => {
    mockHeaders([
      {
        source: `*`,
        headers: [
          {
            key: `x-custom-header`,
            value: `lose-1`,
          },
        ],
      },
      {
        source: `/some-path/foo`,
        headers: [
          {
            key: `x-custom-header`,
            value: `win`,
          },
        ],
      },
      {
        source: `/some-path/*`,
        headers: [
          {
            key: `x-custom-header`,
            value: `lose-2`,
          },
        ],
      },
      {
        source: `/some-path/:slug`,
        headers: [
          {
            key: `x-custom-header`,
            value: `lose-3`,
          },
        ],
      },
    ])
    const matcher = createHeadersMatcher()

    const defaults = []

    const result = matcher(`/some-path/foo`, defaults)

    expect(result).toEqual([
      {
        key: `x-custom-header`,
        value: `win`,
      },
    ])
  })

  it(`dynamic entries have correct specificity`, () => {
    mockHeaders([
      {
        source: `*`,
        headers: [
          {
            key: `x-custom-header`,
            value: `lose-1`,
          },
        ],
      },
      {
        source: `/some-path/*`,
        headers: [
          {
            key: `x-custom-header`,
            value: `lose-2`,
          },
        ],
      },
      {
        source: `/some-path/:slug`,
        headers: [
          {
            key: `x-custom-header`,
            value: `win`,
          },
        ],
      },
    ])
    const matcher = createHeadersMatcher()

    const defaults = []

    const result = matcher(`/some-path/foo`, defaults)

    expect(result).toEqual([
      {
        key: `x-custom-header`,
        value: `win`,
      },
    ])
  })
})
