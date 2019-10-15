const _ = require(`lodash`)

const writeToCache = jest.spyOn(require(`../persist`), `writeToCache`)
const { saveState, store, readState } = require(`../index`)

const {
  actions: { createPage },
} = require(`../actions`)

const mockWrittenContent = new Map()
jest.mock(`fs-extra`, () => {
  return {
    writeFileSync: jest.fn((file, content) =>
      mockWrittenContent.set(file, content)
    ),
    readFileSync: jest.fn(file => mockWrittenContent.get(file)),
  }
})

describe(`redux db`, () => {
  const initialComponentsState = _.cloneDeep(store.getState().components)

  beforeEach(() => {
    store.dispatch(
      createPage(
        {
          path: `/my-sweet-new-page/`,
          // seems like jest serializer doesn't play nice with Maps on Windows
          component: `/Users/username/dev/site/src/templates/my-sweet-new-page.js`,
          // The context is passed as props to the component as well
          // as into the component's GraphQL query.
          context: {
            id: `123456`,
          },
        },
        { name: `default-site-plugin` }
      )
    )

    writeToCache.mockClear()
    mockWrittenContent.clear()
  })

  it(`expect components state to be empty initially`, () => {
    expect(initialComponentsState).toEqual(new Map())
  })

  it(`should write cache to disk`, async () => {
    await saveState()

    expect(writeToCache).toBeCalled()

    // reset state in memory
    store.dispatch({
      type: `DELETE_CACHE`,
    })
    // make sure store in memory is empty
    expect(store.getState().components).toEqual(initialComponentsState)

    // read data that was previously cached
    const data = readState()

    // make sure data was read and is not the same as our clean redux state
    expect(data.components).not.toEqual(initialComponentsState)

    // yuck - loki and redux will have different shape of redux state (nodes and nodesByType)
    expect(_.omit(data, [`nodes`, `nodesByType`])).toMatchSnapshot()
  })
})
