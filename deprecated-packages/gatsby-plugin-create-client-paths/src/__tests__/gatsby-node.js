const { onCreatePage } = require(`../gatsby-node`)

describe(`onCreatePage`, () => {
  let createPage

  beforeEach(() => {
    createPage = jest.fn()
  })

  afterEach(() => {
    createPage.mockRestore()
  })

  it(`calls createPage with correct matchPath`, () => {
    onCreatePage(
      {
        page: {
          path: `/app/`,
          matchPath: undefined,
        },
        actions: {
          createPage,
        },
      },
      { prefixes: [`/*`, `/app/*`] }
    )
    expect(createPage).toHaveBeenCalledWith({
      matchPath: `/app/*`,
      path: `/app/`,
    })
  })

  it(`doesn't set matchPath if already set`, () => {
    onCreatePage(
      {
        page: {
          path: `/app/`,
          matchPath: `/app/*`,
        },
        actions: {
          createPage,
        },
      },
      { prefixes: [`/*`, `/app/*`] }
    )
    expect(createPage).toHaveBeenCalledTimes(0)
  })
})
