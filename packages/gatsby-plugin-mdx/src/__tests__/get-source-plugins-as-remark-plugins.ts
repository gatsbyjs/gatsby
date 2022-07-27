import { getSourcePluginsAsRemarkPlugins } from "../get-source-plugins-as-remark-plugins"
import { mockGatsbyApi } from "../__fixtures__/test-utils"

const { getNode, getNodesByType, reporter, cache, pathPrefix } = mockGatsbyApi()

describe(`transform gatsby-remark plugins into regular plugins`, () => {
  it(`skips on non-functionals`, async () => {
    await expect(
      getSourcePluginsAsRemarkPlugins({
        gatsbyRemarkPlugins: [],
        getNode,
        getNodesByType,
        reporter,
        cache,
        pathPrefix,
      })
    ).resolves.toMatchInlineSnapshot()
  })
})
