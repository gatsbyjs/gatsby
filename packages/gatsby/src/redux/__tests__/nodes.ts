const { actions } = require(`../actions`)
const nodeReducer = require(`../reducers/nodes`)
const nodeTouchedReducer = require(`../reducers/nodes-touched`)

jest.mock(`../../db/nodes`)
jest.mock(`../nodes`)

const dispatch = jest.fn()

describe(`Create and update nodes`, () => {
  beforeEach(() => {
    dispatch.mockClear()
  })

  it(`allows creating nodes`, () => {
    actions.createNode(
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
      {
        name: `tests`,
      }
    )(dispatch)
    const action = dispatch.mock.calls[0][0]
    expect(action).toMatchSnapshot({
      payload: { internal: { counter: expect.any(Number) } },
    })
    expect(fromMapToObject(nodeReducer(undefined, action))).toMatchSnapshot({
      hi: { internal: { counter: expect.any(Number) } },
    })
  })

  it(`allows updating nodes`, () => {
    actions.createNode(
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
          array: [
            0,
            1,
            {
              boom: true,
            },
          ],
        },
      },
      {
        name: `tests`,
      }
    )(dispatch)
    const action = dispatch.mock.calls[0][0]

    actions.createNode(
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
      {
        name: `tests`,
      }
    )(dispatch)
    const updateAction = dispatch.mock.calls[1][0]

    let state = nodeReducer(undefined, action)
    state = nodeReducer(state, updateAction)
    expect(state.get(`hi`).pickle).toEqual(false)
    expect(state.get(`hi`).deep.array[0]).toEqual(1)
    expect(state.get(`hi`).deep2.boom).toEqual(`foo`)
  })

  it(`nodes that are added are also "touched"`, () => {
    actions.createNode(
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
      {
        name: `tests`,
      }
    )(dispatch)
    const action = dispatch.mock.calls[0][0]

    let state = nodeTouchedReducer(undefined, action)

    expect(state instanceof Set).toBe(true)

    expect(state.has(`hi`)).toBe(true)
  })

  it(`allows adding fields to nodes`, () => {
    actions.createNode(
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
      {
        name: `tests`,
      }
    )(dispatch)
    const action = dispatch.mock.calls[0][0]
    let state = nodeReducer(undefined, action)

    const addFieldAction = actions.createNodeField(
      {
        node: state.get(`hi`),
        name: `joy`,
        value: `soul's delight`,
      },
      {
        name: `test`,
      }
    )

    state = nodeReducer(state, addFieldAction)
    expect(fromMapToObject(state)).toMatchSnapshot({
      hi: { internal: { counter: expect.any(Number) } },
    })
  })

  it(`throws error if a field is updated by a plugin not its owner`, () => {
    actions.createNode(
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
      {
        name: `tests`,
      }
    )(dispatch)
    const action = dispatch.mock.calls[0][0]
    let state = nodeReducer(undefined, action)

    const addFieldAction = actions.createNodeField(
      {
        node: state.get(`hi`),
        name: `joy`,
        value: `soul's delight`,
      },
      {
        name: `test`,
      }
    )
    state = nodeReducer(state, addFieldAction)

    function callActionCreator() {
      actions.createNodeField(
        {
          node: state.get(`hi`),
          name: `joy`,
          value: `soul's delight`,
        },
        {
          name: `test2`,
        }
      )
    }
    expect(callActionCreator).toThrowError(
      `A plugin tried to update a node field that it doesn't own`
    )
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
      {
        name: `pluginA`,
      }
    )(dispatch)

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
        {
          name: `pluginB`,
        }
      )(dispatch)
    }

    expect(callActionCreator).toThrowError(
      `The plugin "pluginB" created a node of a type owned by another plugin.`
    )
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
        {
          name: `pluginA`,
        }
      )(dispatch)
    }

    expect(callActionCreator).toThrowError(
      `Plugins creating nodes can not set data on the reserved field "fields"
      as this is reserved for plugins which wish to extend your nodes.`
    )
  })
})

const fromMapToObject = map => {
  const obj = {}
  Array.from(map.entries()).forEach(([key, value]) => {
    obj[key] = value
  })
  return obj
}
