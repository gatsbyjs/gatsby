const { actions, boundActions } = require(`../actions`)
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
          mediaType: `test`,
          owner: `tests`,
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
          mediaType: `test`,
          owner: `tests`,
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
          mediaType: `test`,
          owner: `tests`,
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
    expect(state[`hi`].deep).toEqual({ array: [1, 2] })
    expect(state[`hi`].deep2).toEqual({ boom: `foo` })
  })

  it(`nodes that are added are also "touched"`, () => {
    const action = actions.createNode(
      {
        id: `hi`,
        children: [],
        parent: `test`,
        internal: {
          contentDigest: `hasdfljds`,
          mediaType: `test`,
          owner: `tests`,
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
          mediaType: `test`,
          owner: `tests`,
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
        fieldName: `joy`,
        fieldValue: `soul's delight`,
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
          mediaType: `test`,
          owner: `tests`,
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
        fieldName: `joy`,
        fieldValue: `soul's delight`,
      },
      { name: `test` }
    )
    state = nodeReducer(state, addFieldAction)

    function callActionCreator() {
      actions.createNodeField(
        {
          node: state[`hi`],
          fieldName: `joy`,
          fieldValue: `soul's delight`,
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
          mediaType: `test`,
          owner: `pluginA`,
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
            mediaType: `test`,
            owner: `pluginB`,
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
            mediaType: `test`,
            owner: `pluginA`,
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
