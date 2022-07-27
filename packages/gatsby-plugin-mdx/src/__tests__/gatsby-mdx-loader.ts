import { LoaderContext } from "webpack"
import { createFileToMdxCacheKey } from "../cache-helpers"
import gatsbyMDXLoader from "../gatsby-mdx-loader"
import { mockGatsbyApi } from "../__fixtures__/test-utils"

const source = `---
title: layout test
---

# Layout test

Does it wrap?

<Example/>
`

const { cache, getNode, reporter } = mockGatsbyApi()

const getNodeMock = getNode as jest.Mock

describe(`webpack loader: parses MDX and transforms it into JSX`, () => {
  it(`parses file with frontmatter data`, async () => {
    const resourcePath = `/mocked`
    const resourceQuery = `mocked`
    getNodeMock.mockImplementation(() => {
      return {
        body: source,
      }
    })
    cache.set(createFileToMdxCacheKey(resourcePath), 123)

    const transformedSourcePromise = gatsbyMDXLoader.call(
      {
        getOptions: () => {
          return {
            options: {},
            getNode,
            cache,
            reporter,
          }
        },
        resourcePath,
        resourceQuery,
        addDependency: jest.fn(),
      } as unknown as LoaderContext<string>,
      source
    )
    await expect(transformedSourcePromise).resolves.toMatchInlineSnapshot(`
            "---
            title: layout test
            ---

            # Layout test

            Does it wrap?"
          `)
  })
})
