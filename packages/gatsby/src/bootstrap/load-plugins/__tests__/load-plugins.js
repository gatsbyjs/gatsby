const loadPlugins = require(`../index`)

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
})
