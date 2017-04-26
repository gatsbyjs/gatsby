const { actions, boundActions } = require("../actions")
const nodeReducer = require("../reducers/nodes")
const nodeTouchedReducer = require("../reducers/nodes-touched")

describe(`Create and update nodes`, () => {
  // TODO add these back when we stop directly consoleing errors.
  // Right now makes tests noisy.
  //
  // it(`validates created nodes`, () => {
  // const action = actions.createNode({
  // type: `Test`,
  // });
  // expect(action.type).toEqual(`VALIDATION_ERROR`);
  // });
  // it(`validates updated nodes`, () => {
  // const action = actions.updateNode({
  // type: `Test`,
  // });
  // expect(action.type).toEqual(`VALIDATION_ERROR`);
  // });

  it(`allows creating nodes`, () => {
    const action = actions.createNode({
      id: `hi`,
      contentDigest: `hasdfljds`,
      children: [],
      parent: `test`,
      mediaType: `test`,
      pluginName: `tests`,
      type: `Test`,
      pickle: true,
    })
    expect(action).toMatchSnapshot()
    expect(nodeReducer(undefined, action)).toMatchSnapshot()
  })

  it(`allows updating nodes`, () => {
    const action = actions.createNode({
      id: `hi`,
      contentDigest: `hasdfljds`,
      children: [],
      parent: `test`,
      mediaType: `test`,
      pluginName: `tests`,
      type: `Test`,
      pickle: true,
    })
    const updateAction = actions.createNode({
      id: `hi`,
      contentDigest: `hasdfljds`,
      children: [],
      parent: `test`,
      mediaType: `test`,
      pluginName: `tests`,
      type: `Test`,
      pickle: false,
    })
    let state = nodeReducer(undefined, action)
    state = nodeReducer(state, updateAction)
    expect(state["hi"].pickle).toEqual(false)
  })

  it(`nodes that are added are also "touched"`, () => {
    const action = actions.createNode({
      id: `hi`,
      contentDigest: `hasdfljds`,
      children: [],
      parent: `test`,
      mediaType: `test`,
      pluginName: `tests`,
      type: `Test`,
      pickle: true,
    })
    let state = nodeTouchedReducer(undefined, action)
    expect(state["hi"]).toBe(true)
  })
})
