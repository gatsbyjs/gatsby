"use strict"

const glob = require(`glob`)
const reducer = require(`../reducers/pages`)
const { actions } = require(`../actions`)
const { readFile } = require(`fs-extra`)

jest.mock(`fs`)
jest.mock(`fs-extra`, () => {
  return {
    readFile: jest.fn(() => `contents`),
  }
})

const dispatch = jest.fn()

afterEach(() => {
  readFile.mockClear()
  dispatch.mockClear()
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
  })

  it(`allows you to add pages`, () => {
    actions.createPage(
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

  it(`Fails if path is missing`, () => {
    actions.createPage(
      {
        component: `/path/to/file1.js`,
      },
      { id: `test`, name: `test` }
    )(dispatch)
    const action = dispatch.mock.calls[0][0]
    expect(action.payload.message).toMatchSnapshot()
  })

  it(`Fails if component path is missing`, () => {
    actions.createPage(
      {
        path: `/whatever/`,
      },
      { id: `test`, name: `test` }
    )(dispatch)
    const action = dispatch.mock.calls[0][0]
    expect(action.payload.message).toMatchSnapshot()
  })

  it(`Fails if the component path isn't absolute`, () => {
    actions.createPage(
      {
        path: `/whatever/`,
        component: `cheese.js`,
      },
      { id: `test`, name: `test` }
    )(dispatch)
    const action = dispatch.mock.calls[0][0]
    expect(action.payload.message).toMatchSnapshot()
  })

  it(`Fails if use a reserved field in the context object`, () => {
    actions.createPage(
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
    expect(action.payload.message).toMatchSnapshot()
  })

  it(`adds an initial forward slash if the user doesn't`, () => {
    actions.createPage(
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

  it(`allows you to add pages with context`, () => {
    actions.createPage(
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

  it(`allows you to add pages with matchPath`, () => {
    actions.createPage(
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

  it(`allows you to add multiple pages`, () => {
    actions.createPage(
      {
        path: `/hi/`,
        component: `/whatever/index.js`,
      },
      { id: `test`, name: `test` }
    )(dispatch)
    const action = dispatch.mock.calls[0][0]
    actions.createPage(
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

  it(`allows you to update existing pages (based on path)`, () => {
    actions.createPage(
      {
        path: `/hi/`,
        component: `/whatever/index.js`,
      },
      { id: `test`, name: `test` }
    )(dispatch)
    const action = dispatch.mock.calls[0][0]

    // Change the component
    actions.createPage(
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

  it(`allows you to delete paths`, () => {
    actions.createPage(
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
