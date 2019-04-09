const path = require(`path`)
const fs = require(`fs-extra`)
const { saveState, store } = require(`../index`)
const {
  actions: { createPage },
} = require(`../actions`)

jest.mock(`fs-extra`)

describe(`redux db`, () => {
  beforeEach(() => {
    store.dispatch(
      createPage(
        {
          path: `/my-sweet-new-page/`,
          component: path.resolve(`./src/templates/my-sweet-new-page.js`),
          // The context is passed as props to the component as well
          // as into the component's GraphQL query.
          context: {
            id: `123456`,
          },
        },
        { name: `default-site-plugin` }
      )
    )

    fs.writeFile.mockClear()
  })
  it(`should write cache to disk`, async () => {
    await saveState()

    expect(fs.writeFile).toBeCalledWith(
      expect.stringContaining(`.cache/redux-state.json`),
      expect.stringContaining(`my-sweet-new-page.js`)
    )
  })

  it(`does not write to the cache when DANGEROUSLY_DISABLE_OOM is set`, async () => {
    process.env.DANGEROUSLY_DISABLE_OOM = true

    await saveState()

    expect(fs.writeFile).not.toBeCalled()

    delete process.env.DANGEROUSLY_DISABLE_OOM
  })
})
