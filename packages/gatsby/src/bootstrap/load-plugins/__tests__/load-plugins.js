const loadPlugins = require(`../index`)

describe(`Load plugins`, () => {
  it(`Load plugins for a site`, async () => {
    let plugins = await loadPlugins({ plugins: [] })

    // Delete the resolve path as that varies depending
    // on platform so will cause snapshots to differ.
    plugins = plugins.map(plugin => {
      return {
        ...plugin,
        resolve: ``,
      }
    })

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

    // Delete the resolve path as that varies depending
    // on platform so will cause snapshots to differ.
    plugins = plugins.map(plugin => {
      return {
        ...plugin,
        resolve: ``,
      }
    })

    expect(plugins).toMatchSnapshot()
  })
})
