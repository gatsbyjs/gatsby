import { LoaderContext } from "webpack"
import gatsbyLayoutLoader from "../gatsby-layout-loader"

const source = `---
title: layout test
---

# Layout test

Does it wrap?`

const nodeExists: () => boolean = () => true

describe(`webpack loader: loads and injects Gatsby layout component`, () => {
  it(`parses file with frontmatter data`, async () => {
    const loaderPromise = gatsbyLayoutLoader.call(
      {
        getOptions: () => {
          return {
            nodeExists,
          }
        },
        resourcePath: `/mocked`,
        resourceQuery: `mocked`,
        addDependency: jest.fn(),
      } as unknown as LoaderContext<string>,
      source
    )
    expect(await loaderPromise).resolves.toMatchInlineSnapshot()
  })
})
