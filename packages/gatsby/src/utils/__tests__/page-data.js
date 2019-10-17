const _ = require(`lodash`)

const writeToCache = jest.spyOn(require(`../../redux/persist`), `writeToCache`)
const { saveState, store, readState } = require(`../../redux/index`)
const { getNewPageKeys, removePreviousPageData } = require(`../page-data.js`)

const {
  actions: { createPage },
} = require(`../../redux/actions`)

const mockWrittenContent = new Map()
jest.mock(`fs-extra`, () => {
  return {
    writeFileSync: jest.fn((file, content) =>
      mockWrittenContent.set(file, content)
    ),
    readFileSync: jest.fn(file => mockWrittenContent.get(file)),
    removeSync: jest.fn(file => mockWrittenContent.get(file)),
  }
})

describe(`Page Data`, () => {
  const initialPageState = _.cloneDeep(store.getState().pages)

  beforeEach(() => {
    store.dispatch(
      createPage(
        {
          path: `/my-test-page/`,
          component: `/Users/username/dev/site/src/templates/my-test-page.js`,
          context: {
            id: `123`,
            page: `content`,
          },
        },
        { name: `default-site-plugin` }
      )
    )

    writeToCache.mockClear()
    mockWrittenContent.clear()
  })

  it(`expect page state to be empty initially`, () => {
    expect(initialPageState).toEqual(new Map())
  })

  it(`expect an array of page keys that have changed from cache`, async () => {
    await saveState()

    store.dispatch(
      createPage(
        {
          path: `/my-test-page/`,
          component: `/Users/username/dev/site/src/templates/my-test-page.js`,
          context: {
            id: `123`,
            page: `content has changed`, // data updated
          },
        },
        { name: `default-site-plugin` }
      )
    )

    const pageKeys = await getNewPageKeys(store.getState(), readState())
    expect(pageKeys).toEqual([`/my-test-page/`])
  })

  it(`expect an empty array if no changes from cache`, async () => {
    await saveState()

    store.dispatch(
      createPage(
        {
          path: `/my-test-page/`,
          component: `/Users/username/dev/site/src/templates/my-test-page.js`,
          context: {
            id: `123`,
            page: `content`,
          },
        },
        { name: `default-site-plugin` }
      )
    )

    const pageKeys = await getNewPageKeys(store.getState(), readState())
    expect(pageKeys).toEqual([])
  })

  it(`expect that the page stored in cache but not in state is deleted`, async () => {
    await saveState()
    const dir = `/Users/username/`

    // reset state in memory
    store.dispatch({
      type: `DELETE_CACHE`,
    })

    const deletedPageKeys = await removePreviousPageData(
      dir,
      store.getState(),
      readState()
    )
    expect(deletedPageKeys).toEqual([`/my-test-page/`])
  })

  it(`expect no action page data is in state and cache`, async () => {
    await saveState()
    const dir = `/Users/username/`

    const deletedPageKeys = await removePreviousPageData(
      dir,
      store.getState(),
      readState()
    )
    expect(deletedPageKeys).toEqual([])
  })
})
