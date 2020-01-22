jest.mock(`fs`, () => {
  return {
    existsSync: jest.fn().mockImplementation(() => true),
    writeFileSync: jest.fn(),
    mkdirSync: jest.fn(),
    readFileSync: jest.fn().mockImplementation(() => `someIconImage`),
    statSync: jest.fn(),
  }
})
/*
 * We mock sharp because it depends on fs implementation (which is mocked)
 * this causes test failures, so mock it to avoid
 *
 */

jest.mock(`sharp`, () => {
  let sharp = jest.fn(
    () =>
      new (class {
        resize() {
          return this
        }
        toFile() {
          return Promise.resolve()
        }
        metadata() {
          return {
            width: 128,
            height: 128,
          }
        }
      })()
  )

  sharp.simd = jest.fn()
  sharp.concurrency = jest.fn()

  return sharp
})

jest.mock(`gatsby-core-utils`, () => {
  return {
    cpuCoreCount: jest.fn(() => `1`),
    createContentDigest: jest.fn(() => `contentDigest`),
  }
})

const fs = require(`fs`)
const path = require(`path`)
const sharp = require(`sharp`)
const reporter = {
  activityTimer: jest.fn().mockImplementation(function() {
    return {
      start: jest.fn(),
      end: jest.fn(),
    }
  }),
}
const { onPostBootstrap } = require(`../gatsby-node`)

const apiArgs = {
  reporter,
}

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
      purpose: `all`,
    },
    {
      src: `icons/icon-128x128.png`,
      sizes: `128x128`,
      type: `image/png`,
    },
  ],
}

describe(`Test plugin manifest options`, () => {
  beforeEach(() => {
    fs.writeFileSync.mockReset()
    fs.mkdirSync.mockReset()
    fs.existsSync.mockReset()
    sharp.mockClear()
  })

  // the require of gatsby-node performs the invoking
  it(`invokes sharp.simd for optimization`, () => {
    expect(sharp.simd).toHaveBeenCalledTimes(1)
  })

  it(`correctly works with default parameters`, async () => {
    await onPostBootstrap(apiArgs, {
      name: `GatsbyJS`,
      short_name: `GatsbyJS`,
      start_url: `/`,
      background_color: `#f7f0eb`,
      theme_color: `#a2466c`,
      display: `standalone`,
    })
    const contents = fs.writeFileSync.mock.calls[0][1]
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(`public`, `manifest.webmanifest`),
      expect.anything()
    )
    expect(sharp).toHaveBeenCalledTimes(0)
    expect(contents).toMatchSnapshot()
  })

  it(`correctly works with multiple icon paths`, async () => {
    fs.existsSync.mockReturnValue(false)

    const size = 48

    const pluginSpecificOptions = {
      icons: [
        {
          src: `icons/icon-48x48.png`,
          sizes: `${size}x${size}`,
          type: `image/png`,
        },
        {
          src: `other-icons/icon-48x48.png`,
          sizes: `${size}x${size}`,
          type: `image/png`,
        },
      ],
    }

    await onPostBootstrap(apiArgs, {
      ...manifestOptions,
      ...pluginSpecificOptions,
    })

    const firstIconPath = path.join(
      `public`,
      path.dirname(`icons/icon-48x48.png`)
    )
    const secondIconPath = path.join(
      `public`,
      path.dirname(`other-icons/icon-48x48.png`)
    )

    expect(fs.mkdirSync).toHaveBeenNthCalledWith(1, firstIconPath)
    expect(fs.mkdirSync).toHaveBeenNthCalledWith(2, secondIconPath)
  })

  it(`invokes sharp if icon argument specified`, async () => {
    fs.statSync.mockReturnValueOnce({ isFile: () => true })

    const icon = `pretend/this/exists.png`
    const size = 48

    const pluginSpecificOptions = {
      icon: icon,
      icons: [
        {
          src: `icons/icon-48x48.png`,
          sizes: `${size}x${size}`,
          type: `image/png`,
        },
      ],
    }

    await onPostBootstrap(apiArgs, {
      ...manifestOptions,
      ...pluginSpecificOptions,
    })

    expect(sharp).toHaveBeenCalledWith(icon, { density: size })
    expect(sharp).toHaveBeenCalledTimes(2)
  })

  it(`fails on non existing icon`, async () => {
    fs.statSync.mockReturnValueOnce({ isFile: () => false })

    const pluginSpecificOptions = {
      icon: `non/existing/path`,
    }

    await expect(
      onPostBootstrap(apiArgs, {
        ...manifestOptions,
        ...pluginSpecificOptions,
      })
    ).rejects.toThrow(
      `icon (non/existing/path) does not exist as defined in gatsby-config.js. Make sure the file exists relative to the root of the site.`
    )

    expect(sharp).toHaveBeenCalledTimes(0)
  })

  it(`doesn't write extra properties to manifest`, async () => {
    const pluginSpecificOptions = {
      icon: undefined,
      legacy: true,
      plugins: [],
      theme_color_in_head: false,
      cache_busting_mode: `name`,
      include_favicon: true,
      crossOrigin: `anonymous`,
      icon_options: {},
    }
    await onPostBootstrap(apiArgs, {
      ...manifestOptions,
      ...pluginSpecificOptions,
    })

    expect(sharp).toHaveBeenCalledTimes(0)
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.anything(),
      JSON.stringify(manifestOptions)
    )
  })

  it(`does file name based cache busting`, async () => {
    fs.statSync.mockReturnValueOnce({ isFile: () => true })

    const pluginSpecificOptions = {
      icon: `images/gatsby-logo.png`,
      legacy: true,
      cache_busting_mode: `name`,
    }
    await onPostBootstrap(apiArgs, {
      ...manifestOptions,
      ...pluginSpecificOptions,
    })

    expect(sharp).toHaveBeenCalledTimes(2)
    expect(fs.writeFileSync).toMatchSnapshot()
  })

  it(`does not do cache cache busting`, async () => {
    fs.statSync.mockReturnValueOnce({ isFile: () => true })

    const pluginSpecificOptions = {
      icon: `images/gatsby-logo.png`,
      legacy: true,
      cache_busting_mode: `none`,
    }
    await onPostBootstrap(apiArgs, {
      ...manifestOptions,
      ...pluginSpecificOptions,
    })

    expect(sharp).toHaveBeenCalledTimes(2)
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.anything(),
      JSON.stringify(manifestOptions)
    )
  })

  it(`icon options iterator adds options and the icon array take precedence`, async () => {
    fs.statSync.mockReturnValueOnce({ isFile: () => true })

    const pluginSpecificOptions = {
      icon: `images/gatsby-logo.png`,
      icon_options: {
        purpose: `maskable`,
      },
    }
    await onPostBootstrap(apiArgs, {
      ...manifestOptions,
      ...pluginSpecificOptions,
    })

    expect(sharp).toHaveBeenCalledTimes(2)
    const content = JSON.parse(fs.writeFileSync.mock.calls[0][1])
    expect(content.icons[0].purpose).toEqual(`all`)
    expect(content.icons[1].purpose).toEqual(`maskable`)
  })

  it(`generates all language versions`, async () => {
    fs.statSync.mockReturnValueOnce({ isFile: () => true })
    const pluginSpecificOptions = {
      localize: [
        {
          ...manifestOptions,
          start_url: `/de/`,
          lang: `de`,
        },
        {
          ...manifestOptions,
          start_url: `/es/`,
          lang: `es`,
        },
        {
          ...manifestOptions,
          start_url: `/`,
        },
      ],
    }
    const { localize, ...manifest } = pluginSpecificOptions
    const expectedResults = localize.concat(manifest).map(x => {
      return { ...manifest, ...x }
    })

    await onPostBootstrap(apiArgs, pluginSpecificOptions)

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.anything(),
      JSON.stringify(expectedResults[0])
    )
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.anything(),
      JSON.stringify(expectedResults[1])
    )
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.anything(),
      JSON.stringify(expectedResults[2])
    )
  })

  it(`merges default and language options`, async () => {
    fs.statSync.mockReturnValueOnce({ isFile: () => true })
    const pluginSpecificOptions = {
      ...manifestOptions,
      localize: [
        {
          start_url: `/de/`,
          lang: `de`,
        },
        {
          start_url: `/es/`,
          lang: `es`,
        },
      ],
    }
    const { localize, ...manifest } = pluginSpecificOptions
    const expectedResults = localize
      .concat(manifest)
      .map(({ language, manifest }) => {
        return {
          ...manifestOptions,
          ...manifest,
        }
      })

    await onPostBootstrap(apiArgs, pluginSpecificOptions)

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.anything(),
      JSON.stringify(expectedResults[0])
    )
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.anything(),
      JSON.stringify(expectedResults[1])
    )
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.anything(),
      JSON.stringify(expectedResults[2])
    )
  })
})
