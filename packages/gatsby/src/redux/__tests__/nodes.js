const { actions, boundActions } = require(`../actions`)
const nodeReducer = require(`../reducers/nodes`)
const nodeTouchedReducer = require(`../reducers/nodes-touched`)

describe(`Create and update nodes`, () => {
  it(`allows creating nodes`, () => {
    const action = actions.createNode({
      id: `hi`,
      children: [],
      parent: `test`,
      internal: {
        contentDigest: `hasdfljds`,
        mediaType: `test`,
        pluginOwner: `tests`,
        type: `Test`,
      },
      pickle: true,
    })
    expect(action).toMatchSnapshot()
    expect(nodeReducer(undefined, action)).toMatchSnapshot()
  })

  it(`allows updating nodes`, () => {
    const action = actions.createNode({
      id: `hi`,
      children: [],
      parent: `test`,
      internal: {
        contentDigest: `hasdfljds`,
        mediaType: `test`,
        pluginOwner: `tests`,
        type: `Test`,
      },
      pickle: true,
      deep: {
        array: [0, 1, { boom: true }],
      },
    })
    const updateAction = actions.createNode({
      id: `hi`,
      children: [],
      parent: `test`,
      internal: {
        contentDigest: `hasdfljds`,
        mediaType: `test`,
        pluginOwner: `tests`,
        type: `Test`,
      },
      pickle: false,
      deep: {
        array: [1, 2],
      },
      deep2: {
        boom: `foo`,
      },
    })
    let state = nodeReducer(undefined, action)
    state = nodeReducer(state, updateAction)
    expect(state[`hi`].pickle).toEqual(false)
    expect(state[`hi`].deep).toEqual({ array: [1, 2] })
    expect(state[`hi`].deep2).toEqual({ boom: `foo` })
  })

  it(`nodes that are added are also "touched"`, () => {
    const action = actions.createNode({
      id: `hi`,
      children: [],
      parent: `test`,
      internal: {
        contentDigest: `hasdfljds`,
        mediaType: `test`,
        pluginOwner: `tests`,
        type: `Test`,
      },
      pickle: true,
    })
    let state = nodeTouchedReducer(undefined, action)
    expect(state[`hi`]).toBe(true)
  })
})
