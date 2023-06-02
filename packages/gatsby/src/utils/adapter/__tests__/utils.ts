import type { Header } from "../../../redux/types"
import { splitInDynamicAndStaticBuckets } from "../utils"

const DEFAULTS: Header["headers"] = [
  {
    key: `cache-control`,
    value: `public, max-age=0, must-revalidate`,
  },
  {
    key: `x-xss-protection`,
    value: `1; mode=block`,
  },
]

const dynamicHeader: Header = {
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
}

const staticHeader: Header = {
  source: `/some-path/`,
  headers: [
    {
      key: `x-custom-header`,
      value: `b`,
    },
  ],
}

const HEADERS_MINIMAL = [dynamicHeader, staticHeader] satisfies Header[]

describe(`splitInStaticAndDynamicBuckets`, () => {
  it(`works with minimal data`, () => {
    const output = splitInDynamicAndStaticBuckets(HEADERS_MINIMAL)

    expect(output.dynamicHeaders).toEqual([dynamicHeader])
    expect(output.staticHeaders).toEqual([staticHeader])
  })
  it(`recognizes all dynamic identifiers`, () => {
    const dynamic = [
      dynamicHeader,
      {
        source: `/blog/:slug`,
        headers: [
          {
            key: `x-custom-header`,
            value: `c`,
          },
        ],
      },
      {
        source: `/blog/:slug*`,
        headers: [
          {
            key: `x-custom-header`,
            value: `d`,
          },
        ],
      }
    ]
    const output = splitInDynamicAndStaticBuckets([...dynamic, staticHeader])

    expect(output.dynamicHeaders).toEqual([...dynamic])
    expect(output.staticHeaders).toEqual([staticHeader])
  })
})
