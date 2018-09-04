const _ = require(`lodash`)
const { writePages, resetLastHash } = require(`../pages-writer`)

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

describe(`Pages writer`, () => {
  it(`writes pages with the good order`, async () => {
    const spy = jest.spyOn(mockFsExtra, `writeFile`)

    await writePages()
    const data1 = spy.mock.calls[3][1]

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

    // Ensure testing in the same conditions as if we have
    // removed the .cache folder
    resetLastHash()

    await writePages()
    const data2 = spy.mock.calls[7][1]

    expect(spy.mock.calls.length).toBe(8)

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

    expect(data1).toEqual(expectedResult)
    expect(data2).toEqual(expectedResult)
  })
})
