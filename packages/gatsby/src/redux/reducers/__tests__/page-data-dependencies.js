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
      connections: new Map(),
      nodes: new Map([[`123`, new Set([`/hi/`])]]),
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
      connections: new Map(),
      nodes: new Map([[`1.2.3`, new Set([`/hi/`, `/hi2/`, `/blog/`])]]),
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
      connections: new Map([[`Markdown.Remark`, new Set([`/hi/`, `/hi2/`])]]),
      nodes: new Map(),
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

    expect(state.connections.get(`MarkdownRemark`).size).toEqual(2)
    expect(state.nodes.get(1).size).toEqual(2)
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
  // it(`removes node/page connections when the node is deleted`, () => {
  // const action = {
  // type: `CREATE_COMPONENT_DEPENDENCY`,
  // payload: {
  // path: `/hi/`,
  // nodeId: `123`,
  // },
  // }

  // let state = reducer(undefined, action)

  // const deleteNodeAction = {
  // type: `DELETE_NODE`,
  // payload: 123,
  // }

  // state = reducer(state, deleteNodeAction)

  // expect(state).toEqual({
  // connections: {},
  // nodes: {},
  // })
  // })
  // it(`removes node/page connections when multiple nodes are deleted`, () => {
  // const action = {
  // type: `CREATE_COMPONENT_DEPENDENCY`,
  // payload: {
  // path: `/hi/`,
  // nodeId: `123`,
  // },
  // }
  // const action2 = {
  // type: `CREATE_COMPONENT_DEPENDENCY`,
  // payload: {
  // path: `/hi2/`,
  // nodeId: `1234`,
  // },
  // }

  // let state = reducer(undefined, action)
  // state = reducer(state, action2)

  // const deleteNodeAction = {
  // type: `DELETE_NODES`,
  // payload: [123, 1234],
  // }

  // state = reducer(state, deleteNodeAction)

  // expect(state).toEqual({
  // connections: {},
  // nodes: {},
  // })
  // })
})
