const loadPlugins = require(`../load-plugins`)

describe(`Load plugins`, () => {
  it(`load plugins for a site`, async () => {
    let plugins = await loadPlugins({ plugins: [] })

    // Delete the resolve path as that varies depending
    // on platform so will cause snapshots to differ.
    plugins = plugins.map(plugin => ({
      ...plugin,
      resolve: ``,
    }))

    expect(plugins).toMatchSnapshot()
  })
})
