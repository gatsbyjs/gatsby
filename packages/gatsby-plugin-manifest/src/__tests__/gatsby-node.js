jest.mock(`fs`, () => {
  return {
    ...jest.requireActual(`fs`),
    existsSync: jest.fn().mockImplementation(() => true),
    writeFileSync: jest.fn(),
    mkdirSync: jest.fn(),
    readFileSync: jest.fn().mockImplementation(() => `someIconImage`),
    copyFileSync: jest.fn(),
    statSync: jest.fn(),
  }
})
/*
 * We mock sharp because it depends on fs implementation (which is mocked)
 * this causes test failures, so mock it to avoid
 *
 */

jest.mock(`sharp`, () => {
  const sharp = jest.fn(
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
            format: `png`,
          }
        }
      })()
  )

  sharp.simd = jest.fn()
  sharp.concurrency = jest.fn()

  return sharp
})

jest.mock(`gatsby-core-utils`, () => {
  const originalCoreUtils = jest.requireActual(`gatsby-core-utils`)
  return {
    slash: originalCoreUtils.slash,
    cpuCoreCount: jest.fn(() => `1`),
    createContentDigest: originalCoreUtils.createContentDigest,
  }
})

const fs = require(`fs`)
const path = require(`path`)
const sharp = require(`sharp`)
const reporter = {
  activityTimer: jest.fn().mockImplementation(function () {
    return {
      start: jest.fn(),
      end: jest.fn(),
    }
  }),
}
const { onPostBootstrap, pluginOptionsSchema } = require(`../gatsby-node`)
const { testPluginOptionsSchema } = require(`gatsby-plugin-utils`)

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

// Some of these tests check the number of sharp calls to assert that the
// correct number of images are created.
//
// As long as an `icon` is defined in the config, there's always an extra
// call to sharp to check the source icon is square. Therefore the assertions
// check for N + 1 sharp calls, where N is the expected number of icons
// generated.
describe(`Test plugin manifest options`, () => {
  beforeEach(() => {
    fs.writeFileSync.mockReset()
    fs.mkdirSync.mockReset()
    fs.existsSync.mockReset()
    fs.copyFileSync.mockReset()
    sharp.mockClear()
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

    // No sharp calls because this is manual mode: user provides all icon sizes
    // rather than the plugin generating them
    expect(sharp).toHaveBeenCalledTimes(0)
    expect(fs.mkdirSync).toHaveBeenNthCalledWith(1, firstIconPath, {
      recursive: true,
    })
    expect(fs.mkdirSync).toHaveBeenNthCalledWith(2, secondIconPath, {
      recursive: true,
    })
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

    // One call to sharp to check the source icon is square
    // + another for the favicon (enabled by default)
    // + another for the single icon in the `icons` config
    // => 3 total calls
    expect(sharp).toHaveBeenCalledTimes(3)
    expect(sharp).toHaveBeenCalledWith(icon, { density: 32 }) // the default favicon
    expect(sharp).toHaveBeenCalledWith(icon, { density: size })
  })

  it(`skips favicon generation if "include_favicon" option is set to false`, async () => {
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
      include_favicon: false,
    }

    await onPostBootstrap(apiArgs, {
      ...manifestOptions,
      ...pluginSpecificOptions,
    })

    // Only two sharp calls here: one to check the source icon size,
    // and another to generate the single icon in the config.
    // By default, there would be a 3rd call for the favicon, but that's
    // disabled by the `include_favicon` option.
    expect(sharp).toHaveBeenCalledTimes(2)
    expect(sharp).toHaveBeenCalledWith(icon, { density: size })
    expect(fs.copyFileSync).toHaveBeenCalledTimes(0)
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

    // Two icons in the config, plus a favicon, plus one call to check the
    // source icon size => 4 total calls to sharp.
    expect(sharp).toHaveBeenCalledTimes(4)

    // Filenames in the manifest should be suffixed with the content digest
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

    // Two icons in the config, plus a favicon, plus one call to check the
    // source icon size => 4 total calls to sharp.
    expect(sharp).toHaveBeenCalledTimes(4)
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

    // Two icons in the config, plus a favicon, plus one call to check the
    // source icon size => 4 total calls to sharp.
    expect(sharp).toHaveBeenCalledTimes(4)
    const content = JSON.parse(fs.writeFileSync.mock.calls[0][1])
    expect(content.icons[0].purpose).toEqual(`all`)
    expect(content.icons[1].purpose).toEqual(`maskable`)
  })

  it(`correctly works with pathPrefix`, async () => {
    await onPostBootstrap(
      { ...apiArgs, basePath: `/blog` },
      {
        name: `GatsbyJS`,
        short_name: `GatsbyJS`,
        start_url: `/`,
        background_color: `#f7f0eb`,
        theme_color: `#a2466c`,
        display: `standalone`,
      }
    )
    const contents = fs.writeFileSync.mock.calls[0][1]
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(`public`, `manifest.webmanifest`),
      expect.anything()
    )
    expect(sharp).toHaveBeenCalledTimes(0)
    expect(contents).toMatchSnapshot()
  })

  it(`generates all language versions`, async () => {
    fs.statSync.mockReturnValueOnce({ isFile: () => true })
    const pluginSpecificOptions = {
      ...manifestOptions,
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

  it(`generates all language versions with pathPrefix`, async () => {
    fs.statSync.mockReturnValueOnce({ isFile: () => true })
    const pluginSpecificOptions = {
      ...manifestOptions,
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
      ],
    }

    const { localize, ...manifest } = pluginSpecificOptions
    const expectedResults = [manifest].concat(localize).map(x => {
      return {
        ...manifest,
        ...x,
        start_url: path.posix.join(`/blog`, x.start_url),
        icons: manifest.icons.map(icon => {
          return {
            ...icon,
            src: path.posix.join(`/blog`, icon.src),
          }
        }),
      }
    })

    await onPostBootstrap(
      { ...apiArgs, basePath: `/blog` },
      pluginSpecificOptions
    )

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

  it(`writes SVG to public if src icon is SVG`, async () => {
    sharp.mockReturnValueOnce({
      metadata: () => {
        return { format: `svg` }
      },
    })
    const icon = `this/is/an/icon.svg`
    const specificOptions = {
      ...manifestOptions,
      icon: icon,
    }

    await onPostBootstrap({ ...apiArgs }, specificOptions)

    expect(fs.copyFileSync).toHaveBeenCalledWith(
      expect.stringContaining(`icon.svg`),
      expect.stringContaining(`favicon.svg`)
    )

    expect(fs.copyFileSync).toHaveBeenCalledTimes(1)
  })

  it(`does not write SVG to public if src icon is PNG`, async () => {
    const specificOptions = {
      ...manifestOptions,
      icon: `this/is/an/icon.png`,
    }

    await onPostBootstrap({ ...apiArgs }, specificOptions)

    expect(fs.copyFileSync).toHaveBeenCalledTimes(0)
  })
})

describe(`pluginOptionsSchema`, () => {
  it(`validates options correctly`, async () => {
    const { isValid, errors } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      manifestOptions
    )

    expect(isValid).toBe(true)
    expect(errors).toEqual([])
  })
})
