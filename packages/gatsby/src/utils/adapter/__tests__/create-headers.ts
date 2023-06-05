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

  // TODO: What if path has trailing slash and in another place not?

  it(`works`, () => {
    mockHeaders([
      {
        source: `*`,
        headers: [
          {
            key: `x-custom-header`,
            value: `a`,
          },
          {
            key: `x-another-custom-header`,
            value: `a`,
          },
        ],
      },
      {
        source: `/some-path/`,
        headers: [
          {
            key: `x-custom-header`,
            value: `b`,
          },
        ],
      },
    ])
    const matcher = createHeadersMatcher()

    const defaults = [
      {
        key: `cache-control`,
        value: `public, max-age=0, must-revalidate`,
      },
      {
        key: `x-xss-protection`,
        value: `1; mode=block`,
      },
    ]

    const foo = matcher(`/some-path/`, defaults)

    expect(foo).toEqual([
      ...defaults,
      { key: `x-custom-header`, value: `b` },
      { key: `x-another-custom-header`, value: `a` },
    ])
  })
})
