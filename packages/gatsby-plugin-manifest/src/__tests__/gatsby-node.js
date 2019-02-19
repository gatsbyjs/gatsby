jest.mock(`fs`, () => {
  return {
    existsSync: jest.fn().mockImplementation(() => true),
    writeFileSync: jest.fn(),
    statSync: jest.fn(),
  }
})
/*
 * We mock sharp because it depends on fs implementation (which is mocked)
 * this causes test failures, so mock it to avoid
 */
jest.mock(`sharp`, () => {
  let sharp = jest.fn(
    () =>
      new class {
        resize() {
          return this
        }
        toFile() {
          return Promise.resolve()
        }
      }()
  )
  sharp.simd = jest.fn()
  return sharp
})
const fs = require(`fs`)
const path = require(`path`)
const sharp = require(`sharp`)
const { onPostBootstrap } = require(`../gatsby-node`)

describe(`Test plugin manifest options`, () => {
  beforeEach(() => {
    fs.writeFileSync.mockReset()
  })

  // the require of gatsby-node performs the invoking
  it(`invokes sharp.simd for optimization`, () => {
    expect(sharp.simd).toHaveBeenCalledTimes(1)
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

  it(`invokes sharp if icon argument specified`, async () => {
    fs.statSync.mockReturnValueOnce({ isFile: () => true })

    const icon = `pretend/this/exists.png`
    const size = 48

    await onPostBootstrap([], {
      name: `GatsbyJS`,
      short_name: `GatsbyJS`,
      start_url: `/`,
      background_color: `#f7f0eb`,
      theme_color: `#a2466c`,
      display: `standalone`,
      icon,
      icons: [
        {
          src: `icons/icon-48x48.png`,
          sizes: `${size}x${size}`,
          type: `image/png`,
        },
      ],
    })

    expect(sharp).toHaveBeenCalledWith(icon, { density: size })
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
