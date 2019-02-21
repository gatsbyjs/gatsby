const Redux = require(`redux`)
const { actions } = require(`../actions`)
const nodeReducer = require(`../reducers/nodes`)
const nodeTouchedReducer = require(`../reducers/nodes-touched`)

jest.mock(`../../db/nodes`)
jest.mock(`../nodes`)

const store = Redux.createStore(
  Redux.combineReducers({ nodeReducer, nodeTouchedReducer }),
  {}
)
const dispatch = jest.spyOn(store, `dispatch`)

describe(`Create and update nodes`, () => {
  beforeEach(() => {
    store.dispatch({
      type: `DELETE_CACHE`,
    })
    dispatch.mockClear()
  })

  it(`allows creating nodes`, async () => {
    await actions.createNode(
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
    expect(action).toMatchSnapshot()
    expect(nodeReducer(undefined, action)).toMatchSnapshot()
  })

  it(`allows updating nodes`, async () => {
    await actions.createNode(
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
    await actions.createNode(
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
    const action = dispatch.mock.calls[0][0]
    const updateAction = dispatch.mock.calls[1][0]
    let state = nodeReducer(undefined, action)
    state = nodeReducer(state, updateAction)
    expect(state.get(`hi`).pickle).toEqual(false)
    expect(state.get(`hi`).deep.array[0]).toEqual(1)
    expect(state.get(`hi`).deep2.boom).toEqual(`foo`)
  })

  it(`nodes that are added are also "touched"`, async () => {
    await actions.createNode(
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
    expect(state[`hi`]).toBe(true)
  })

  it(`allows adding fields to nodes`, async () => {
    await actions.createNode(
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
    expect(state).toMatchSnapshot()
  })

  it(`throws error if a field is updated by a plugin not its owner`, async () => {
    await actions.createNode(
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
    expect(callActionCreator).toThrowErrorMatchingSnapshot()
  })

  it(`throws error if a node is created by a plugin not its owner`, async () => {
    await actions.createNode(
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
      return actions.createNode(
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

    expect(await callActionCreator).toThrowErrorMatchingSnapshot()
  })

  it(`throws error if a node sets a value on "fields"`, async () => {
    function callActionCreator() {
      return actions.createNode(
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

    expect(await callActionCreator).toThrowErrorMatchingSnapshot()
  })
})
