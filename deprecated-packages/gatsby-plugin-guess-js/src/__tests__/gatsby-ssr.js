const gatsbySsr = require(`../gatsby-ssr`)
const guessWebpack = require(`guess-webpack/api`)
const fs = require(`fs`)

jest.mock(`guess-webpack/api`)
jest.mock(`fs`)

describe(`gatsby-plugin-guess-js`, () => {
  describe(`gatsby-ssr`, () => {
    it(`should add prefetch links to head components`, () => {
      const path = `some/path`
      const componentChunkName = `chunkName`
      const chunks = [`chunk1`, `chunk2`]
      const pageData = { path, componentChunkName }

      // Mock out webpack.stats.json
      const stats = {
        assetsByChunkName: {
          [componentChunkName]: chunks,
        },
      }
      fs.readFileSync.mockImplementation(file =>
        file === `${process.cwd()}/public/webpack.stats.json`
          ? JSON.stringify(stats)
          : undefined
      )

      // Mock out guess plugin
      guessWebpack.guess.mockImplementation(() => {
        return {
          [path]: `ignored`,
        }
      })

      // mock out static-render.js/loadPageDataSync
      const loadPageDataSync = () => pageData
      const setHeadComponents = jest.fn()
      const pluginOptions = {
        minimumThreshold: 1000,
      }

      gatsbySsr.onRenderBody(
        { loadPageDataSync, setHeadComponents },
        pluginOptions
      )

      expect(setHeadComponents.mock.calls[0][0]).toMatchObject([
        { props: { href: `/chunk1` } },
        { props: { href: `/chunk2` } },
      ])
    })
  })
})
