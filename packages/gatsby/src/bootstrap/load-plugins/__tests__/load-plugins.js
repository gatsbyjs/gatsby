const loadPlugins = require(`../index`)
const load = require(`../load`)
const path = require(`path`)

const pathSpy = jest.spyOn(path, `resolve`)

describe(`Load plugins`, () => {
  /**
   * Replace the resolve path and version string.
   * Resolve path will vary depending on platform.
   * Version can be updated (we use external plugin in default config).
   * Both will cause snapshots to differ.
   */
  const replaceFieldsThatCanVary = plugins =>
    plugins.map(plugin => {
      return {
        ...plugin,
        resolve: ``,
        version: `1.0.0`,
      }
    })

  it(`Load plugins for a site`, async () => {
    let plugins = await loadPlugins({ plugins: [] })

    plugins = replaceFieldsThatCanVary(plugins)

    expect(plugins).toMatchSnapshot()
  })

  it(`Loads plugins defined with an object but without an option key`, async () => {
    const config = {
      plugins: [
        {
          resolve: `___TEST___`,
        },
      ],
    }

    let plugins = await loadPlugins(config)

    plugins = replaceFieldsThatCanVary(plugins)

    expect(plugins).toMatchSnapshot()
  })

  it(`Correctly adjusts plugins folder`, () => {
    const config = {
      plugins: [
        `nonexisting`,
      ],
    }
    pathSpy.mockClear()
    try {
      load(config)
    } catch(err) {
      expect(err.message).toMatch(`Unable to find plugin "nonexisting". Perhaps you need to install its package?`)
      expect(pathSpy).toBeCalledWith(`./plugins/nonexisting`)
    }
  })

  it(`Correctly searches at desired plugin location`, () => {
    const config = {
      pluginsFolder: `./anotherLocation`,
      plugins: [
        `nonexisting`,
      ],
    }
    pathSpy.mockClear()
    try {
      load(config)
    } catch(err) {
      expect(err.message).toMatch(`Unable to find plugin "nonexisting". Perhaps you need to install its package?`)
      expect(pathSpy).toHaveBeenCalledWith(`./anotherLocation/nonexisting`)
    }
  })
})
