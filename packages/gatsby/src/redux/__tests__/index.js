const _ = require(`lodash`)
const path = require(`path`)

const writeToCache = jest.spyOn(require(`../persist`), `writeToCache`)
const { saveState, store, readState } = require(`../index`)

const {
  actions: { createPage },
} = require(`../actions`)

const mockWrittenContent = new Map()
const mockCompatiblePath = path
jest.mock(`fs-extra`, () => {
  return {
    writeFileSync: jest.fn((file, content) =>
      mockWrittenContent.set(file, content)
    ),
    readFileSync: jest.fn(file => mockWrittenContent.get(file)),
    moveSync: jest.fn((from, to) => {
      // This will only work for folders if they are always the full prefix
      // of the file... (that goes for both input dirs). That's the case here.
      if (mockWrittenContent.has(to)) {
        throw new Error(`File/folder exists`)
      }

      // Move all files in this folder as well ... :/
      mockWrittenContent.forEach((value, key) => {
        if (key.startsWith(from)) {
          // rename('foo/bar', 'a/b/c') => foo/bar/ding.js -> a/b/c/ding.js
          // (.replace with string arg will only replace the first occurrence)
          mockWrittenContent.set(
            key.replace(from, to),
            mockWrittenContent.get(key)
          )
          mockWrittenContent.delete(key)
        }
      })
    }),
    existsSync: jest.fn(target => mockWrittenContent.has(target)),
    mkdtempSync: jest.fn(suffix => {
      const dir = mockCompatiblePath.join(
        `some`,
        `tmp` + suffix + Math.random()
      )
      mockWrittenContent.set(dir, Buffer(`empty dir`))
      return dir
    }),
    removeSync: jest.fn(file => mockWrittenContent.delete(file)),
  }
})
jest.mock(`glob`, () => {
  return {
    sync: jest.fn(pattern => {
      // Tricky.
      // Expecting a path prefix, ending with star. Else this won't work :/
      if (pattern.slice(-1) !== `*`) {
        throw new Error(`Expected pattern ending with star`)
      }
      const globPrefix = pattern.slice(0, -1)
      if (globPrefix.includes(`*`)) {
        throw new Error(`Expected pattern to be a prefix`)
      }
      const files = []
      mockWrittenContent.forEach((value, key) => {
        if (key.startsWith(globPrefix)) {
          files.push(key)
        }
      })
      return files
    }),
  }
})

function getFakeNodes() {
  // Set nodes to something or the cache will fail because it asserts this
  // Actual nodes content should match TS type; these are verified
  const map /* : Map<string, IReduxNode>*/ = new Map()
  map.set(`pageA`, {
    id: `pageA`,
    internal: {
      type: `Ding`,
    },
  })
  map.set(`pageB`, {
    id: `pageB`,
    internal: {
      type: `Dong`,
    },
  })
  return map
}

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

  it(`should write redux cache to disk`, async () => {
    expect(initialComponentsState).toEqual(new Map())

    store.getState().nodes = getFakeNodes()

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

    expect(data).toMatchSnapshot()
  })

  describe(`GATSBY_DISABLE_CACHE_PERSISTENCE`, () => {
    beforeAll(() => {
      process.env.GATSBY_DISABLE_CACHE_PERSISTENCE = `truthy`
    })

    afterAll(() => {
      delete process.env.GATSBY_DISABLE_CACHE_PERSISTENCE
    })
    it(`shouldn't write redux cache to disk when GATSBY_DISABLE_CACHE_PERSISTENCE env var is used`, async () => {
      expect(initialComponentsState).toEqual(new Map())

      store.getState().nodes = getFakeNodes()

      await saveState()

      expect(writeToCache).not.toBeCalled()
    })
  })
})
