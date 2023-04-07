import { actions } from "../actions"
import { store } from "../index"
import { nodesReducer } from "../reducers/nodes"
import { IGatsbyNode } from "../types"
import { nodesTouchedReducer } from "../reducers/nodes-touched"

const dispatch = jest.spyOn(store, `dispatch`)
type MapObject = Record<string, IGatsbyNode>

const fromMapToObject = (map: Map<string, any>): MapObject => {
  const obj: MapObject = {}
  Array.from(map.entries()).forEach(([key, value]) => {
    obj[key] = value
  })
  return obj
}

describe(`Create and update nodes`, (): void => {
  beforeEach((): void => {
    store.dispatch({ type: `DELETE_CACHE` })
    dispatch.mockClear()
  })

  it(`allows creating nodes`, (): void => {
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
    expect(fromMapToObject(nodesReducer(undefined, action))).toMatchSnapshot({
      hi: { internal: { counter: expect.any(Number) } },
    })
  })

  it(`allows updating nodes`, (): void => {
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
          contentDigest: `hasdfljds2`,
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

    let state = nodesReducer(undefined, action)
    state = nodesReducer(state, updateAction)

    expect(state.get(`hi`)!.pickle).toEqual(false)
    expect((state.get(`hi`)!.deep as any).array![0]).toEqual(1)
    expect((state.get(`hi`)!.deep2 as any).boom).toEqual(`foo`)
  })

  it(`nodes that are added are also "touched"`, (): void => {
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

    const state = nodesTouchedReducer(undefined, action)

    expect(state instanceof Set).toBe(true)

    expect(state.has(`hi`)).toBe(true)
  })

  it(`allows adding fields to nodes`, (): void => {
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
    let state = nodesReducer(undefined, action)

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

    state = nodesReducer(state, addFieldAction)
    expect(fromMapToObject(state)).toMatchSnapshot({
      hi: { internal: { counter: expect.any(Number) } },
    })
  })

  it(`throws error if a field is updated by a plugin not its owner`, (): void => {
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
    let state = nodesReducer(undefined, action)

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
    state = nodesReducer(state, addFieldAction)

    function callActionCreator(): void {
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

  it(`throws error if a node is created by a plugin not its owner`, (): void => {
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

    function callActionCreator(): void {
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

  it(`throws error if a node sets a value on "fields"`, (): void => {
    function callActionCreator(): void {
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
