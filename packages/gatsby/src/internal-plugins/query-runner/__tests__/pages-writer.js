const _ = require(`lodash`)
const { writePages } = require(`../pages-writer`)

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
            .concat()
            .value(),
      },
    }

    await writePages()

    // `fs.writeFile` is called 4 times while the execution of `writePages`.
    // But it's never called if data to write has the same hash than those
    // of the previous call.
    expect(spy.mock.calls.length).toBe(4)
  })
})
