const { onCreatePage } = require(`../gatsby-node`)

const mockAsync = () => new Promise(resolve => setTimeout(resolve, 10))

describe(`gatsby-plugin-remove-trailing-slashes`, () => {
  const actions = {
    createPage: jest.fn(mockAsync),
    deletePage: jest.fn(mockAsync),
  }

  it(`correctly keeps index /`, async () => {
    await onCreatePage({ actions, page: { path: `/` } })
    expect(actions.createPage).not.toBeCalled()
    expect(actions.deletePage).not.toBeCalled()
  })

  it(`correctly removes slash and recreated page`, async () => {
    await onCreatePage({ actions, page: { path: `/home/` } })
    expect(actions.deletePage).toBeCalledWith({ path: `/home/` })
    expect(actions.createPage).toBeCalledWith({ path: `/home` })
  })
})
