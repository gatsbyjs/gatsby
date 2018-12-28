jest.mock(`fs`, () => {
  return {
    existsSync: jest.fn().mockImplementation(() => true),
    writeFileSync: jest.fn(),
    statSync: jest.fn(),
  }
})
const fs = require(`fs`)
const path = require(`path`)
const { onPostBootstrap } = require(`../gatsby-node`)

describe(`Test plugin manifest options`, () => {
  beforeEach(() => {
    fs.writeFileSync.mockReset()
  })

  it(`correctly works with default parameters`, async () => {
    await onPostBootstrap([], {
      name: `GatsbyJS`,
      short_name: `GatsbyJS`,
      start_url: `/`,
      background_color: `#f7f0eb`,
      theme_color: `#a2466c`,
      display: `standalone`,
    })
    const [filePath, contents] = fs.writeFileSync.mock.calls[0]
    expect(filePath).toEqual(path.join(`public`, `manifest.webmanifest`))
    expect(contents).toMatchSnapshot()
  })

  it(`fails on non existing icon`, done => {
    fs.statSync.mockReturnValueOnce({ isFile: () => false })
    onPostBootstrap([], {
      name: `GatsbyJS`,
      short_name: `GatsbyJS`,
      start_url: `/`,
      background_color: `#f7f0eb`,
      theme_color: `#a2466c`,
      display: `standalone`,
      icon: `non/existing/path`,
      icons: [
        {
          src: `icons/icon-48x48.png`,
          sizes: `48x48`,
          type: `image/png`,
        },
      ],
    }).catch(err => {
      expect(err).toMatchSnapshot()
      done()
    })
  })

  it(`doesn't write extra properties to manifest`, async () => {
    const manifestOptions = {
      name: `GatsbyJS`,
      short_name: `GatsbyJS`,
      start_url: `/`,
      background_color: `#f7f0eb`,
      theme_color: `#a2466c`,
      display: `standalone`,
      icons: [
        {
          src: `icons/icon-48x48.png`,
          sizes: `48x48`,
          type: `image/png`,
        },
      ],
    }
    const pluginSpecificOptions = {
      icon: undefined,
      legacy: true,
      plugins: [],
      theme_color_in_head: false,
    }
    await onPostBootstrap([], {
      ...manifestOptions,
      ...pluginSpecificOptions,
    })

    const content = JSON.parse(fs.writeFileSync.mock.calls[0][1])
    expect(content).toEqual(manifestOptions)
  })
})
