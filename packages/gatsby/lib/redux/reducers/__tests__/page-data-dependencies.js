const reducer = require("../page-data-dependencies")

describe(`add page data dependency`, () => {
  it(`lets you add a node dependency`, () => {
    const action = {
      type: `ADD_PAGE_DEPENDENCY`,
      payload: {
        path: `/hi/`,
        nodeId: `123`,
      },
    }

    expect(reducer(undefined, action)).toEqual({
      connections: {},
      nodes: {
        "123": [`/hi/`],
      },
    })
  })
  it(`lets you add a connection dependency`, () => {
    const action = {
      type: `ADD_PAGE_DEPENDENCY`,
      payload: {
        path: `/hi/`,
        connection: `MarkdownRemark`,
      },
    }

    expect(reducer(undefined, action)).toEqual({
      connections: {
        MarkdownRemark: ["/hi/"],
      },
      nodes: {},
    })
  })
  it(`removes duplicate paths`, () => {
    const action = {
      type: `ADD_PAGE_DEPENDENCY`,
      payload: {
        path: `/hi/`,
        nodeId: 1,
        connection: `MarkdownRemark`,
      },
    }
    const action2 = {
      type: `ADD_PAGE_DEPENDENCY`,
      payload: {
        path: `/hi2/`,
        nodeId: 1,
        connection: `MarkdownRemark`,
      },
    }

    let state = reducer(undefined, action)
    // Do it again
    state = reducer(state, action)
    // Add different action
    state = reducer(state, action2)

    expect(state.connections["MarkdownRemark"].length).toEqual(2)
    expect(state.nodes[1].length).toEqual(2)
  })
  it(`lets you add both a node and connection in one action`, () => {
    const action = {
      type: `ADD_PAGE_DEPENDENCY`,
      payload: {
        path: `/hi/`,
        connection: `MarkdownRemark`,
        nodeId: `SuperCoolNode`,
      },
    }

    let state = reducer(undefined, action)

    expect(state).toMatchSnapshot()
  })
})
