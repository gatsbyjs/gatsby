const reducer = require(`../reducers/pages`)
const { actions } = require(`../actions`)

const start = Date.now()
Date.now = jest.fn(
  () =>
    // const diff = new Date().getTime() - start
    1482363367071 // + diff
)

describe(`Add pages`, () => {
  it(`allows you to add pages`, () => {
    const action = actions.createPage(
      {
        path: `/hi/`,
        component: `/whatever/index.js`,
      },
      { id: `test`, name: `test` }
    )
    const state = reducer(undefined, action)
    expect(action).toMatchSnapshot()
    expect(state).toMatchSnapshot()
  })

  it(`allows you to add pages with context`, () => {
    const action = actions.createPage(
      {
        path: `/hi/`,
        component: `/whatever/index.js`,
        context: {
          id: 123,
        },
      },
      { id: `test`, name: `test` }
    )
    const state = reducer(undefined, action)
    expect(action).toMatchSnapshot()
    expect(state).toMatchSnapshot()
  })

  it(`allows you to add multiple pages`, () => {
    const action = actions.createPage(
      {
        path: `/hi/`,
        component: `/whatever/index.js`,
      },
      { id: `test`, name: `test` }
    )
    const action2 = actions.createPage(
      {
        path: `/hi/pizza/`,
        component: `/whatever/index.js`,
      },
      { id: `test`, name: `test` }
    )
    let state = reducer(undefined, action)
    state = reducer(state, action2)
    expect(state).toMatchSnapshot()
    expect(state.length).toEqual(2)
  })

  it(`allows you to update existing pages (based on path)`, () => {
    const action = actions.createPage(
      {
        path: `/hi/`,
        component: `/whatever/index.js`,
      },
      { id: `test`, name: `test` }
    )

    // Change the component
    const action2 = actions.createPage(
      {
        path: `/hi/`,
        component: `/whatever2/index.js`,
      },
      { id: `test`, name: `test` }
    )

    let state = reducer(undefined, action)
    state = reducer(state, action2)
    expect(state).toMatchSnapshot()
    expect(state.length).toEqual(1)
  })

  it(`allows you to delete paths`, () => {
    const action = actions.createPage(
      {
        path: `/hi/`,
        component: `/whatever/index.js`,
      },
      { name: `test` }
    )
    const action2 = actions.deletePage({ path: `/hi/` })

    let state = reducer(undefined, action)
    state = reducer(state, action2)
    expect(state).toMatchSnapshot()
    expect(state.length).toEqual(0)
  })

  it(`allows you to add pages with multiple components`, () => {
    const action = actions.createPage(
      {
        path: `/hi/`,
        component: [`/whatever/index.js`, `/morewhatever/index.js`],
      },
      { id: `test`, name: `test` }
    )
    const state = reducer(undefined, action)
    expect(action).toMatchSnapshot()
    expect(state).toMatchSnapshot()
  })

  it(`allows you to add pages with context when using multiple components`, () => {
    const action = actions.createPage(
      {
        path: `/hi/`,
        component: [`/whatever/index.js`, `/differentwhatever/index.js`],
        context: {
          id: 123,
        },
      },
      { id: `test`, name: `test` }
    )
    const state = reducer(undefined, action)
    expect(action).toMatchSnapshot()
    expect(state).toMatchSnapshot()
  })

  it(`allows you to add multiple pages each with multiple components`, () => {
    const action = actions.createPage(
      {
        path: `/hi/`,
        component: [`/whatever/index.js`, `/morewhatever/index.js`],
      },
      { id: `test`, name: `test` }
    )
    const action2 = actions.createPage(
      {
        path: `/hi/hotpizza/`,
        component: [`/whatever/index.js`, `/pizza/index.js`],
      },
      { id: `test`, name: `test` }
    )
    let state = reducer(undefined, action)
    state = reducer(state, action2)
    expect(state).toMatchSnapshot()
    expect(state.length).toEqual(2)
  })

  it(`allows you to update existing pages with multiple components (based on path)`, () => {
    const action = actions.createPage(
      {
        path: `/hi/`,
        component: [`/something/index.js`, `/morewhatever/index.js`],
      },
      { id: `test`, name: `test` }
    )

    // Change the component
    const action2 = actions.createPage(
      {
        path: `/hi/`,
        component: [`/whateven/index.js`, `/supercereal/index.js`],
      },
      { id: `test`, name: `test` }
    )

    let state = reducer(undefined, action)
    state = reducer(state, action2)
    expect(state).toMatchSnapshot()
    expect(state.length).toEqual(1)
  })

  it(`allows you to delete paths that have multiple components`, () => {
    const action = actions.createPage(
      {
        path: `/hi/`,
        component: [`/ohhey/index.js`, `/goodbye/index.js`],
      },
      { name: `test` }
    )
    const action2 = actions.deletePage({ path: `/hi/` })

    let state = reducer(undefined, action)
    state = reducer(state, action2)
    expect(state).toMatchSnapshot()
    expect(state.length).toEqual(0)
  })
})
