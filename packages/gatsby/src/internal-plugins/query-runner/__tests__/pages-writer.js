const { writePages, resetLastHash } = require(`../pages-writer`)
const { joinPath } = require(`../../../utils/path`)

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

jest.mock(`../../../redux/`, () => {
  return {
    store: {
      getState: () => mockState,
    },
    emitter: {
      on: () => {},
    },
  }
})

const expectedResult = {
  pages: {
    c: {
      amet: {
        v: { path: `/amet`, matchPath: null },
      },
      ipsum: {
        v: { path: `/ipsum`, matchPath: null },
      },
      lorem: {
        v: { path: `/lorem`, matchPath: null },
      },
      dolor: {
        v: { path: `/dolor`, matchPath: `/foo` },
      },
      sit: {
        v: { path: `/sit`, matchPath: `/bar` },
      },
      foo: {
        v: { path: `/dolor`, matchPath: `/foo` },
      },
      bar: {
        v: { path: `/sit`, matchPath: `/bar` },
      },
    },
  },
  dataPaths: {
    bar: `b/a/r`,
    baz: `b/a/z`,
    foo: `f/o/o`,
  },
}

const now = Date.now()

fdescribe(`Pages writer`, () => {
  beforeEach(() => {
    // Mock current date
    global.Date.now = () => now

    // Ensure testing in the same conditions as if we have
    // removed the .cache folder
    resetLastHash()
  })

  it(`writes pages to disk`, async () => {
    const spy = jest.spyOn(mockFsExtra, `writeFile`)

    await writePages()

    const path = joinPath(
      `my`,
      `gatsby`,
      `project`,
      `.cache`,
      `data.json.${now}`
    )

    // Since multiple calls to writeFile occur at the same time,
    // search through all the function calls to find the one
    // that has the right path
    const call = spy.mock.calls.find(call => call[0] === path)
    expect(call).toBeTruthy()
    expect(JSON.parse(call[1])).toEqual(expectedResult)
  })
})
