const glob = require(`glob`)
const reducer = require(`../reducers/pages`)
const { actions } = require(`../actions`)
const { readFile } = require(`fs-extra`)

const dispatch = jest.fn()

jest.mock(`fs`)
jest.mock(`fs-extra`, () => {
  return {
    readFile: jest.fn(() => `contents`),
  }
})

afterEach(() => {
  readFile.mockClear()
})

Date.now = jest.fn(
  () =>
    // const diff = new Date().getTime() - start
    1482363367071 // + diff
)

glob.sync = jest.fn(() => ``)

describe(`Add pages`, () => {
  const MOCK_FILE_INFO = {
    "/whatever/index.js": `import React from 'react'; export default Page;`,
    "/whatever2/index.js": `import React from 'react'; export default Page;`,
  }

  beforeEach(() => {
    // Set up some mocked out file info before each test
    require(`fs`).__setMockFiles(MOCK_FILE_INFO)
    dispatch.mockClear()
  })

  it(`allows you to add pages`, async () => {
    await actions.createPage(
      {
        path: `/hi/`,
        component: `/whatever/index.js`,
      },
      { id: `test`, name: `test` }
    )(dispatch)
    const action = dispatch.mock.calls[0][0]

    const state = reducer(undefined, action)
    expect(action).toMatchSnapshot()
    expect(state).toMatchSnapshot()
  })

  it(`Fails if path is missing`, async () => {
    await actions.createPage(
      {
        component: `/path/to/file1.js`,
      },
      { id: `test`, name: `test` }
    )(dispatch)
    const action = dispatch.mock.calls[0][0]

    expect(action).toMatchSnapshot()
  })

  it(`Fails if component path is missing`, async () => {
    await actions.createPage(
      {
        path: `/whatever/`,
      },
      { id: `test`, name: `test` }
    )(dispatch)
    const action = dispatch.mock.calls[0][0]

    expect(action).toMatchSnapshot()
  })

  it(`Fails if the component path isn't absolute`, async () => {
    await actions.createPage(
      {
        path: `/whatever/`,
        component: `cheese.js`,
      },
      { id: `test`, name: `test` }
    )(dispatch)
    const action = dispatch.mock.calls[0][0]

    expect(action).toMatchSnapshot()
  })

  it(`Fails if use a reserved field in the context object`, async () => {
    await actions.createPage(
      {
        component: `/path/to/file1.js`,
        path: `/yo/`,
        context: {
          path: `/yo/`,
          matchPath: `/pizz*`,
        },
      },
      { id: `test`, name: `test` }
    )(dispatch)
    const action = dispatch.mock.calls[0][0]

    expect(action).toMatchSnapshot()
  })

  it(`adds an initial forward slash if the user doesn't`, async () => {
    await actions.createPage(
      {
        path: `hi/`,
        component: `/whatever/index.js`,
      },
      { id: `test`, name: `test` }
    )(dispatch)
    const action = dispatch.mock.calls[0][0]

    const state = reducer(undefined, action)
    expect(Array.from(state.values())[0].path).toEqual(`/hi/`)
  })

  it(`allows you to add pages with context`, async () => {
    await actions.createPage(
      {
        path: `/hi/`,
        component: `/whatever/index.js`,
        context: {
          id: 123,
        },
      },
      { id: `test`, name: `test` }
    )(dispatch)
    const action = dispatch.mock.calls[0][0]

    const state = reducer(undefined, action)
    expect(action).toMatchSnapshot()
    expect(state).toMatchSnapshot()
  })

  it(`allows you to add pages with matchPath`, async () => {
    await actions.createPage(
      {
        path: `/hi/`,
        component: `/whatever/index.js`,
        matchPath: `/hi-from-somewhere-else/`,
      },
      { id: `test`, name: `test` }
    )(dispatch)
    const action = dispatch.mock.calls[0][0]

    const state = reducer(undefined, action)
    expect(action).toMatchSnapshot()
    expect(state).toMatchSnapshot()
  })

  it(`allows you to add multiple pages`, async () => {
    await actions.createPage(
      {
        path: `/hi/`,
        component: `/whatever/index.js`,
      },
      { id: `test`, name: `test` }
    )(dispatch)
    const action = dispatch.mock.calls[0][0]

    await actions.createPage(
      {
        path: `/hi/pizza/`,
        component: `/whatever/index.js`,
      },
      { id: `test`, name: `test` }
    )(dispatch)
    const action2 = dispatch.mock.calls[1][0]

    let state = reducer(undefined, action)
    state = reducer(state, action2)
    expect(state).toMatchSnapshot()
    expect(state.size).toEqual(2)
  })

  it(`allows you to update existing pages (based on path)`, async () => {
    await actions.createPage(
      {
        path: `/hi/`,
        component: `/whatever/index.js`,
      },
      { id: `test`, name: `test` }
    )(dispatch)
    const action = dispatch.mock.calls[0][0]

    // Change the component
    await actions.createPage(
      {
        path: `/hi/`,
        component: `/whatever2/index.js`,
      },
      { id: `test`, name: `test` }
    )(dispatch)
    const action2 = dispatch.mock.calls[1][0]

    let state = reducer(undefined, action)
    state = reducer(state, action2)
    expect(state).toMatchSnapshot()
    expect(state.size).toEqual(1)
  })

  it(`allows you to delete paths`, async () => {
    await actions.createPage(
      {
        path: `/hi/`,
        component: `/whatever/index.js`,
      },
      { name: `test` }
    )(dispatch)
    const action = dispatch.mock.calls[0][0]

    const action2 = actions.deletePage({ path: `/hi/` })

    let state = reducer(undefined, action)
    state = reducer(state, action2)
    expect(state).toMatchSnapshot()
    expect(state.size).toEqual(0)
  })
})
