const reducer = require(`../component-data-dependencies`)

describe(`add page data dependency`, () => {
  it(`lets you add a node dependency`, () => {
    const action = {
      type: `CREATE_COMPONENT_DEPENDENCY`,
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
  it(`lets you add a node dependency to multiple paths`, () => {
    const action = {
      type: `CREATE_COMPONENT_DEPENDENCY`,
      payload: {
        path: `/hi/`,
        nodeId: `1.2.3`,
      },
    }
    const action2 = {
      type: `CREATE_COMPONENT_DEPENDENCY`,
      payload: {
        path: `/hi2/`,
        nodeId: `1.2.3`,
      },
    }
    const action3 = {
      type: `CREATE_COMPONENT_DEPENDENCY`,
      payload: {
        path: `/blog/`,
        nodeId: `1.2.3`,
      },
    }

    let state = reducer(undefined, action)
    state = reducer(state, action2)
    state = reducer(state, action3)

    expect(state).toEqual({
      connections: {},
      nodes: {
        "1.2.3": [`/hi/`, `/hi2/`, `/blog/`],
      },
    })
  })
  it(`lets you add a connection dependency`, () => {
    const action = {
      type: `CREATE_COMPONENT_DEPENDENCY`,
      payload: {
        path: `/hi/`,
        connection: `Markdown.Remark`,
      },
    }
    const action2 = {
      type: `CREATE_COMPONENT_DEPENDENCY`,
      payload: {
        path: `/hi2/`,
        connection: `Markdown.Remark`,
      },
    }

    let state = reducer(undefined, action)
    state = reducer(state, action2)

    expect(state).toEqual({
      connections: {
        "Markdown.Remark": [`/hi/`, `/hi2/`],
      },
      nodes: {},
    })
  })
  it(`removes duplicate paths`, () => {
    const action = {
      type: `CREATE_COMPONENT_DEPENDENCY`,
      payload: {
        path: `/hi/`,
        nodeId: 1,
        connection: `MarkdownRemark`,
      },
    }
    const action2 = {
      type: `CREATE_COMPONENT_DEPENDENCY`,
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

    expect(state.connections[`MarkdownRemark`].length).toEqual(2)
    expect(state.nodes[1].length).toEqual(2)
  })
  it(`lets you add both a node and connection in one action`, () => {
    const action = {
      type: `CREATE_COMPONENT_DEPENDENCY`,
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
