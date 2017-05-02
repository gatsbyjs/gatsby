jest.mock(`fs`)

const { postBuild } = require(`../gatsby-node`)

describe(`gatsby-plugin-manifest`, () => {
  it(`should omit plugins key`, () => {
    const fsMock = jest.fn()
    require(`fs`).__setWriteFileSyncFn(fsMock)

    const manifest = {
      name: `Gatsby website`,
      short_name: `Gatsby website`,
      start_url: `/`,
      background_color: `#f7f7f7`,
      theme_color: `#191919`,
      display: `minimal-ui`,
      plugins: `here`,
    }

    postBuild(null, manifest)
    expect(fsMock.mock.calls).toMatchSnapshot()
  })

  it(`should parse keys into snake case`, () => {
    const fsMock = jest.fn()
    require(`fs`).__setWriteFileSyncFn(fsMock)

    const manifest = {
      name: `Gatsby website`,
      shortName: `Gatsby website`,
      startUrl: `/`,
      backgroundColor: `#f7f7f7`,
      themeColor: `#191919`,
      display: `minimal-ui`,
      sidebarAction: {
        defaultIcon: {
          "16": `button/geo-16.png`,
        },
      },
      plugins: `here`,
    }

    postBuild(null, manifest)
    expect(fsMock.mock.calls).toMatchSnapshot()
  })
})
