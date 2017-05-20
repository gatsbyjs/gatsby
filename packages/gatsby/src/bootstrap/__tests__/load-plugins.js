const loadPlugins = require(`../load-plugins`)

describe(`Load plugins`, () => {
  it(`load plugins for a site`, async () => {
    const plugins = await loadPlugins({ plugins: [] })

    expect(plugins).toMatchSnapshot()
  })
})
