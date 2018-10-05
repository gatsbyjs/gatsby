const fs = require(`fs`)
const { onPostBootstrap } = require(`../gatsby-node`)
jest.mock(`fs`)
fs.existsSync.mockImplementation(() => true)
fs.writeFileSync = jest.fn()

describe(`Test plugin manifest options`, () => {
  it(`correctly works with default parameters`, async () => {
    await onPostBootstrap([], {
      name: `GatsbyJS`,
      short_name: `GatsbyJS`,
      start_url: `/`,
      background_color: `#f7f0eb`,
      theme_color: `#a2466c`,
      display: `minimal-ui`,
    })
    expect(fs.writeFileSync.mock.calls).toMatchSnapshot()
  })
  it(`fails on non existing icon`, (done) => {
    fs.statSync.mockReturnValue({ isFile: () => false })
    onPostBootstrap([], {
      name: `GatsbyJS`,
      short_name: `GatsbyJS`,
      start_url: `/`,
      background_color: `#f7f0eb`,
      theme_color: `#a2466c`,
      display: `minimal-ui`,
      icon: `non/existing/path`,
      icons: [{
        src: `icons/icon-48x48.png`,
        sizes: `48x48`,
        type: `image/png`,
      }],
    })
    .catch((err) => {
      expect(err).toMatchSnapshot()
      done()
    })
  })
})
