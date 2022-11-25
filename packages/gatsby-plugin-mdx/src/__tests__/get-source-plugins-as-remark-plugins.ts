import { createProcessor } from "@mdx-js/mdx"

import { getSourcePluginsAsRemarkPlugins } from "../get-source-plugins-as-remark-plugins"
import { mockGatsbyApi } from "../__fixtures__/test-utils"

const { getNode, getNodesByType, reporter, cache, pathPrefix } = mockGatsbyApi()

describe(`transform gatsby-remark plugins into regular plugins`, () => {
  it(`skips on non-functionals`, async () => {
    await expect(
      getSourcePluginsAsRemarkPlugins({
        gatsbyRemarkPlugins: [
          {
            resolve: `mocked`,
          },
        ],

        getNode,
        getNodesByType,
        reporter,
        cache,
        pathPrefix,
      })
    ).resolves.toHaveLength(0)
  })
  it(`transforms source functions into regular plugins`, async () => {
    const module = jest.fn()
    const plugins = await getSourcePluginsAsRemarkPlugins({
      gatsbyRemarkPlugins: [
        {
          resolve: `mocked`,
          module,
        },
      ],

      getNode,
      getNodesByType,
      reporter,
      cache,
      pathPrefix,
    })
    expect(plugins).toHaveLength(1)
    if (plugins === undefined) {
      throw new Error(`Returned plugins should not be undefined`)
    }
    if (typeof plugins[0] !== `function`) {
      throw new Error(`Returned plugin should a function`)
    }
    const remarkPlugin = plugins[0]
    const processor = createProcessor({
      remarkPlugins: [remarkPlugin],
    })

    await processor.process(``)

    expect(module).toHaveBeenCalled()
  })
})
