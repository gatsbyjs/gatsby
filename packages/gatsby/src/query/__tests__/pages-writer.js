const _ = require(`lodash`)
const { writePages, resetLastHash } = require(`../pages-writer`)
const { joinPath } = require(`../../utils/path`)

const jsonDataPathsFixture = require(`./fixtures/jsonDataPaths.json`)
const pagesFixture = require(`./fixtures/pages.json`)

jest.mock(`fs-extra`, () => {
  return {
    writeFile: (filePath, data) => Promise.resolve(),
    move: () => {},
  }
})
const mockFsExtra = require(`fs-extra`)

let mockState = {
  program: {
    _: [`build`],
    directory: `my/gatsby/project`,
  },
  jsonDataPaths: jsonDataPathsFixture,
  pages: {
    values: () => pagesFixture,
  },
}

jest.mock(`../../redux/`, () => {
  return {
    store: {
      getState: () => mockState,
    },
    emitter: {
      on: () => {},
    },
  }
})

const expectedResult = JSON.stringify({
  pages: [
    { path: `/amet`, matchPath: null },
    { path: `/ipsum`, matchPath: null },
    { path: `/lorem`, matchPath: null },
    { path: `/dolor`, matchPath: `/foo` },
    { path: `/sit`, matchPath: `/bar` },
  ],
  dataPaths: {
    bar: `b/a/r`,
    baz: `b/a/z`,
    foo: `f/o/o`,
  },
})

const now = Date.now()

describe(`Pages writer`, () => {
  beforeEach(() => {
    // Mock current date
    global.Date.now = () => now

    // Ensure testing in the same conditions as if we have
    // removed the .cache folder
    resetLastHash()
  })

  it(`writes pages with the good order #1`, async () => {
    const spy = jest.spyOn(mockFsExtra, `writeFile`)

    await writePages()

    expect(spy).toBeCalledWith(
      joinPath(`my`, `gatsby`, `project`, `.cache`, `data.json.${now}`),
      expectedResult
    )
  })

  it(`writes pages with the good order #2`, async () => {
    const spy = jest.spyOn(mockFsExtra, `writeFile`)

    // Reorder data in state
    mockState = {
      ...mockState,
      jsonDataPaths: {
        bar: jsonDataPathsFixture.bar,
        foo: jsonDataPathsFixture.foo,
        baz: jsonDataPathsFixture.baz,
      },
      pages: {
        values: () =>
          _(pagesFixture)
            .chunk(2)
            .reverse()
            .flatten()
            .value(),
      },
    }

    await writePages()

    expect(spy).toBeCalledWith(
      joinPath(`my`, `gatsby`, `project`, `.cache`, `data.json.${now}`),
      expectedResult
    )
  })
})
