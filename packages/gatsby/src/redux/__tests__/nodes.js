const { actions } = require(`../actions`)
const nodeReducer = require(`../reducers/nodes`)
const nodeTouchedReducer = require(`../reducers/nodes-touched`)

describe(`Create and update nodes`, () => {
  it(`allows creating nodes`, () => {
    const action = actions.createNode(
      {
        id: `hi`,
        children: [],
        parent: `test`,
        internal: {
          contentDigest: `hasdfljds`,
          type: `Test`,
        },
        pickle: true,
      },
      { name: `tests` }
    )
    expect(action).toMatchSnapshot()
    expect(nodeReducer(undefined, action)).toMatchSnapshot()
  })

  it(`allows updating nodes`, () => {
    const action = actions.createNode(
      {
        id: `hi`,
        children: [],
        parent: `test`,
        internal: {
          contentDigest: `hasdfljds`,
          type: `Test`,
        },
        pickle: true,
        deep: {
          array: [0, 1, { boom: true }],
        },
      },
      { name: `tests` }
    )
    const updateAction = actions.createNode(
      {
        id: `hi`,
        children: [],
        parent: `test`,
        internal: {
          contentDigest: `hasdfljds`,
          type: `Test`,
        },
        pickle: false,
        deep: {
          array: [1, 2],
        },
        deep2: {
          boom: `foo`,
        },
      },
      { name: `tests` }
    )
    let state = nodeReducer(undefined, action)
    state = nodeReducer(state, updateAction)
    expect(state[`hi`].pickle).toEqual(false)
    expect(state[`hi`].deep.array[0]).toEqual(1)
    expect(state[`hi`].deep2.boom).toEqual(`foo`)
  })

  it(`deletes previously transformed children nodes when the parent node is updated`, () => {
    const action = actions.createNode(
      {
        id: `hi`,
        children: [],
        parent: `test`,
        internal: {
          contentDigest: `hasdfljds`,
          type: `Test`,
        },
      },
      { name: `tests` }
    )
    let state = nodeReducer(undefined, action)

    const createChildAction = actions.createNode(
      {
        id: `hi-1`,
        children: [],
        parent: `hi`,
        internal: {
          contentDigest: `hasdfljds-1`,
          type: `Test-1`,
        },
      },
      { name: `tests` }
    )
    state = nodeReducer(state, createChildAction)

    const addChildToParent = actions.createParentChildLink(
      {
        parent: state[`hi`],
        child: state[`hi-1`],
      },
      { name: `tests` }
    )
    state = nodeReducer(state, addChildToParent)

    const create2ndChildAction = actions.createNode(
      {
        id: `hi-1-1`,
        children: [],
        parent: `hi-1`,
        internal: {
          contentDigest: `hasdfljds-1-1`,
          type: `Test-1-1`,
        },
      },
      { name: `tests` }
    )
    state = nodeReducer(state, create2ndChildAction)

    const add2ndChildToParent = actions.createParentChildLink(
      {
        parent: state[`hi-1`],
        child: state[`hi-1-1`],
      },
      { name: `tests` }
    )
    state = nodeReducer(state, add2ndChildToParent)

    const updateAction = actions.createNode(
      {
        id: `hi`,
        children: [],
        parent: `test`,
        internal: {
          contentDigest: `hasdfljds2`,
          type: `Test`,
        },
      },
      { name: `tests` }
    )
    state = nodeReducer(state, updateAction)
    expect(Object.keys(state).length).toEqual(1)
  })

  it(`deletes previously transformed children nodes when the parent node is deleted`, () => {
    const action = actions.createNode(
      {
        id: `hi`,
        children: [],
        parent: `test`,
        internal: {
          contentDigest: `hasdfljds`,
          type: `Test`,
        },
      },
      { name: `tests` }
    )
    let state = nodeReducer(undefined, action)

    const secondNodeAction = actions.createNode(
      {
        id: `hi2`,
        children: [],
        parent: `test`,
        internal: {
          contentDigest: `hasdfljds`,
          type: `Test`,
        },
      },
      { name: `tests` }
    )
    state = nodeReducer(state, secondNodeAction)

    const createChildAction = actions.createNode(
      {
        id: `hi-1`,
        children: [],
        parent: `hi`,
        internal: {
          contentDigest: `hasdfljds-1`,
          type: `Test-1`,
        },
      },
      { name: `tests` }
    )
    state = nodeReducer(state, createChildAction)

    const addChildToParent = actions.createParentChildLink(
      {
        parent: state[`hi`],
        child: state[`hi-1`],
      },
      { name: `tests` }
    )
    state = nodeReducer(state, addChildToParent)

    const create2ndChildAction = actions.createNode(
      {
        id: `hi-1-1`,
        children: [],
        parent: `hi-1`,
        internal: {
          contentDigest: `hasdfljds-1-1`,
          type: `Test-1-1`,
        },
      },
      { name: `tests` }
    )
    state = nodeReducer(state, create2ndChildAction)

    const add2ndChildToParent = actions.createParentChildLink(
      {
        parent: state[`hi-1`],
        child: state[`hi-1-1`],
      },
      { name: `tests` }
    )
    state = nodeReducer(state, add2ndChildToParent)

    const deleteNodeAction = actions.deleteNode(`hi`, { name: `tests` })
    const deleteNodeState = nodeReducer(state, deleteNodeAction)
    expect(Object.keys(deleteNodeState).length).toEqual(1)
  })

  it(`deletes previously transformed children nodes when parent nodes are deleted`, () => {
    const action = actions.createNode(
      {
        id: `hi`,
        children: [],
        parent: `test`,
        internal: {
          contentDigest: `hasdfljds`,
          type: `Test`,
        },
      },
      { name: `tests` }
    )
    let state = nodeReducer(undefined, action)

    const createChildAction = actions.createNode(
      {
        id: `hi-1`,
        children: [],
        parent: `hi`,
        internal: {
          contentDigest: `hasdfljds-1`,
          type: `Test-1`,
        },
      },
      { name: `tests` }
    )
    state = nodeReducer(state, createChildAction)

    const addChildToParent = actions.createParentChildLink(
      {
        parent: state[`hi`],
        child: state[`hi-1`],
      },
      { name: `tests` }
    )
    state = nodeReducer(state, addChildToParent)

    const create2ndChildAction = actions.createNode(
      {
        id: `hi-1-1`,
        children: [],
        parent: `hi-1`,
        internal: {
          contentDigest: `hasdfljds-1-1`,
          type: `Test-1-1`,
        },
      },
      { name: `tests` }
    )
    state = nodeReducer(state, create2ndChildAction)

    const add2ndChildToParent = actions.createParentChildLink(
      {
        parent: state[`hi-1`],
        child: state[`hi-1-1`],
      },
      { name: `tests` }
    )
    state = nodeReducer(state, add2ndChildToParent)

    const deleteNodesAction = actions.deleteNodes([`hi`], { name: `tests` })
    const deleteNodesState = nodeReducer(state, deleteNodesAction)
    expect(Object.keys(deleteNodesState).length).toEqual(0)
  })

  it(`allows deleting nodes`, () => {
    const action = actions.createNode(
      {
        id: `hi`,
        children: [],
        parent: `test`,
        internal: {
          contentDigest: `hasdfljds`,
          type: `Test`,
        },
        pickle: true,
        deep: {
          array: [0, 1, { boom: true }],
        },
      },
      { name: `tests` }
    )
    const deleteAction = actions.deleteNode(`hi`)

    let state = nodeReducer(undefined, action)
    state = nodeReducer(state, deleteAction)
    expect(state[`hi`]).toBeUndefined()
  })

  it(`nodes that are added are also "touched"`, () => {
    const action = actions.createNode(
      {
        id: `hi`,
        children: [],
        parent: `test`,
        internal: {
          contentDigest: `hasdfljds`,
          type: `Test`,
        },
        pickle: true,
      },
      { name: `tests` }
    )
    let state = nodeTouchedReducer(undefined, action)
    expect(state[`hi`]).toBe(true)
  })

  it(`allows adding fields to nodes`, () => {
    const action = actions.createNode(
      {
        id: `hi`,
        children: [],
        parent: `test`,
        internal: {
          contentDigest: `hasdfljds`,
          type: `Test`,
        },
        pickle: true,
      },
      { name: `tests` }
    )
    let state = nodeReducer(undefined, action)

    const addFieldAction = actions.createNodeField(
      {
        node: state[`hi`],
        name: `joy`,
        value: `soul's delight`,
      },
      { name: `test` }
    )
    state = nodeReducer(state, addFieldAction)
    expect(state).toMatchSnapshot()
  })

  it(`throws error if a field is updated by a plugin not its owner`, () => {
    const action = actions.createNode(
      {
        id: `hi`,
        children: [],
        parent: `test`,
        internal: {
          contentDigest: `hasdfljds`,
          type: `Test`,
        },
        pickle: true,
      },
      { name: `tests` }
    )
    let state = nodeReducer(undefined, action)

    const addFieldAction = actions.createNodeField(
      {
        node: state[`hi`],
        name: `joy`,
        value: `soul's delight`,
      },
      { name: `test` }
    )
    state = nodeReducer(state, addFieldAction)

    function callActionCreator() {
      actions.createNodeField(
        {
          node: state[`hi`],
          name: `joy`,
          value: `soul's delight`,
        },
        { name: `test2` }
      )
    }
    expect(callActionCreator).toThrowErrorMatchingSnapshot()
  })

  it(`throws error if a node is created by a plugin not its owner`, () => {
    actions.createNode(
      {
        id: `hi`,
        children: [],
        parent: `test`,
        internal: {
          contentDigest: `hasdfljds`,
          type: `mineOnly`,
        },
        pickle: true,
      },
      { name: `pluginA` }
    )

    function callActionCreator() {
      actions.createNode(
        {
          id: `hi2`,
          children: [],
          parent: `test`,
          internal: {
            contentDigest: `hasdfljds`,
            type: `mineOnly`,
          },
          pickle: true,
        },
        { name: `pluginB` }
      )
    }

    expect(callActionCreator).toThrowErrorMatchingSnapshot()
  })

  it(`throws error if a node sets a value on "fields"`, () => {
    function callActionCreator() {
      actions.createNode(
        {
          id: `hi`,
          children: [],
          parent: `test`,
          fields: {
            test: `I can't do this but I like to test boundaries`,
          },
          internal: {
            contentDigest: `hasdfljds`,
            type: `mineOnly`,
          },
          pickle: true,
        },
        { name: `pluginA` }
      )
    }

    expect(callActionCreator).toThrowErrorMatchingSnapshot()
  })
})
