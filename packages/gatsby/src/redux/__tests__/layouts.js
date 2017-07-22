const reducer = require(`../reducers/pages`)
const { actions } = require(`../actions`)

describe(`Add layouts`, () => {
  it(`allows you to add layouts`, () => {
    const action = actions.createLayout(
      {
        id: `index`,
        component: `/whatever/index.js`,
      },
      { name: `test` }
    )
    const state = reducer(undefined, action)
    expect(action).toMatchSnapshot()
    expect(state).toMatchSnapshot()
  })

  it(`allows you to add pages with context`, () => {
    const action = actions.createLayout(
      {
        id: `index`,
        component: `/whatever/index.js`,
        context: {
          title: `layout title`,
        },
      },
      { name: `test` }
    )
    const state = reducer(undefined, action)
    expect(action).toMatchSnapshot()
    expect(state).toMatchSnapshot()
  })

  it(`allows you to add multiple pages`, () => {
    const action = actions.createLayout(
      {
        id: `index`,
        component: `/whatever/index.js`,
      },
      { name: `test` }
    )
    const action2 = actions.createLayout(
      {
        id: `indexpizza/`,
        component: `/whatever/index.js`,
      },
      { name: `test` }
    )
    let state = reducer(undefined, action)
    state = reducer(state, action2)
    expect(state).toMatchSnapshot()
    expect(state.length).toEqual(2)
  })

  it(`allows you to update existing pages (based on id)`, () => {
    const action = actions.createLayout(
      {
        id: `index`,
        component: `/whatever/index.js`,
      },
      { name: `test` }
    )

    // Change the component
    const action2 = actions.createLayout(
      {
        id: `index`,
        component: `/whatever2/index.js`,
      },
      { name: `test` }
    )

    let state = reducer(undefined, action)
    state = reducer(state, action2)
    expect(state).toMatchSnapshot()
    expect(state.length).toEqual(1)
  })

  it(`allows you to delete ids`, () => {
    const action = actions.createLayout(
      {
        id: `index`,
        component: `/whatever/index.js`,
      },
      { name: `test` }
    )
    const action2 = actions.deletePage({ id: `index` })

    let state = reducer(undefined, action)
    state = reducer(state, action2)
    expect(state).toMatchSnapshot()
    expect(state.length).toEqual(0)
  })
})
