const { actions } = require(`../actions`)
const { store, getNode } = require(`../index`)
const nodeReducer = require(`../reducers/nodes`)
const nodeTouchedReducer = require(`../reducers/nodes-touched`)

describe(`Create and update nodes`, () => {
  beforeEach(() => {
    store.dispatch({
      type: `DELETE_CACHE`,
    })
  })

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
      {
        name: `tests`,
      }
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
      {
        name: `tests`,
      }
    )
    let state = nodeReducer(undefined, action)
    state = nodeReducer(state, updateAction)
    expect(state[`hi`].pickle).toEqual(false)
    expect(state[`hi`].deep.array[0]).toEqual(1)
    expect(state[`hi`].deep2.boom).toEqual(`foo`)
  })

  it(`deletes previously transformed children nodes when the parent node is updated`, () => {
    store.dispatch(
      actions.createNode(
        {
          id: `hi`,
          children: [],
          parent: null,
          internal: {
            contentDigest: `hasdfljds`,
            type: `Test`,
          },
        },
        {
          name: `tests`,
        }
      )
    )

    store.dispatch(
      actions.createNode(
        {
          id: `hi-1`,
          children: [],
          parent: `hi`,
          internal: {
            contentDigest: `hasdfljds-1`,
            type: `Test-1`,
          },
        },
        {
          name: `tests`,
        }
      )
    )

    store.dispatch(
      actions.createParentChildLink(
        {
          parent: store.getState().nodes[`hi`],
          child: store.getState().nodes[`hi-1`],
        },
        {
          name: `tests`,
        }
      )
    )

    store.dispatch(
      actions.createNode(
        {
          id: `hi-1-1`,
          children: [],
          parent: `hi-1`,
          internal: {
            contentDigest: `hasdfljds-1-1`,
            type: `Test-1-1`,
          },
        },
        {
          name: `tests`,
        }
      )
    )

    store.dispatch(
      actions.createParentChildLink(
        {
          parent: store.getState().nodes[`hi-1`],
          child: store.getState().nodes[`hi-1-1`],
        },
        {
          name: `tests`,
        }
      )
    )

    store.dispatch(
      actions.createNode(
        {
          id: `hi`,
          children: [],
          parent: `test`,
          internal: {
            contentDigest: `hasdfljds2`,
            type: `Test`,
          },
        },
        {
          name: `tests`,
        }
      )
    )
    expect(Object.keys(store.getState().nodes).length).toEqual(1)
  })

  it(`deletes previously transformed children nodes when the parent node is deleted`, () => {
    store.dispatch(
      actions.createNode(
        {
          id: `hi`,
          children: [],
          parent: `test`,
          internal: {
            contentDigest: `hasdfljds`,
            type: `Test`,
          },
        },
        {
          name: `tests`,
        }
      )
    )
    store.dispatch(
      actions.createNode(
        {
          id: `hi2`,
          children: [],
          parent: `test`,
          internal: {
            contentDigest: `hasdfljds`,
            type: `Test`,
          },
        },
        {
          name: `tests`,
        }
      )
    )
    store.dispatch(
      actions.createNode(
        {
          id: `hi-1`,
          children: [],
          parent: `hi`,
          internal: {
            contentDigest: `hasdfljds-1`,
            type: `Test-1`,
          },
        },
        {
          name: `tests`,
        }
      )
    )
    store.dispatch(
      actions.createParentChildLink(
        {
          parent: store.getState().nodes[`hi`],
          child: getNode(`hi-1`),
        },
        {
          name: `tests`,
        }
      )
    )
    store.dispatch(
      actions.createNode(
        {
          id: `hi-1-1`,
          children: [],
          parent: `hi-1`,
          internal: {
            contentDigest: `hasdfljds-1-1`,
            type: `Test-1-1`,
          },
        },
        {
          name: `tests`,
        }
      )
    )
    store.dispatch(
      actions.createParentChildLink(
        {
          parent: getNode(`hi-1`),
          child: getNode(`hi-1-1`),
        },
        {
          name: `tests`,
        }
      )
    )

    store.dispatch(
      actions.deleteNode(
        {
          node: getNode(`hi`),
        },
        {
          name: `tests`,
        }
      )
    )
    expect(Object.keys(store.getState().nodes).length).toEqual(1)
  })

  it(`deletes previously transformed children nodes when parent nodes are deleted`, () => {
    store.dispatch(
      actions.createNode(
        {
          id: `hi`,
          children: [],
          parent: `test`,
          internal: {
            contentDigest: `hasdfljds`,
            type: `Test`,
          },
        },
        {
          name: `tests`,
        }
      )
    )
    store.dispatch(
      actions.createNode(
        {
          id: `hi-1`,
          children: [],
          parent: `hi`,
          internal: {
            contentDigest: `hasdfljds-1`,
            type: `Test-1`,
          },
        },
        {
          name: `tests`,
        }
      )
    )
    store.dispatch(
      actions.createParentChildLink(
        {
          parent: getNode(`hi`),
          child: getNode(`hi-1`),
        },
        {
          name: `tests`,
        }
      )
    )
    store.dispatch(
      actions.createNode(
        {
          id: `hi-1-1`,
          children: [],
          parent: `hi-1`,
          internal: {
            contentDigest: `hasdfljds-1-1`,
            type: `Test-1-1`,
          },
        },
        {
          name: `tests`,
        }
      )
    )
    store.dispatch(
      actions.createParentChildLink(
        {
          parent: getNode(`hi-1`),
          child: getNode(`hi-1-1`),
        },
        {
          name: `tests`,
        }
      )
    )
    store.dispatch(
      actions.deleteNodes([`hi`], {
        name: `tests`,
      })
    )
    expect(Object.keys(store.getState().nodes).length).toEqual(0)
  })

  it(`allows deleting nodes`, () => {
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
    )
    actions.deleteNode({
      node: getNode(`hi`),
    })
    expect(getNode(`hi`)).toBeUndefined()
  })

  it(`warns when using old deleteNode signature `, () => {
    console.warn = jest.fn()
    store.dispatch(
      actions.createNode(
        {
          id: `hi`,
          children: [],
          parent: `test`,
          internal: {
            contentDigest: `hasdfljds`,
            type: `Test`,
          },
        },
        {
          name: `tests`,
        }
      )
    )

    expect(getNode(`hi`)).toMatchSnapshot()
    store.dispatch(
      actions.deleteNode(`hi`, getNode(`hi`), {
        name: `tests`,
      })
    )

    expect(getNode(`hi`)).toBeUndefined()

    const deprecationNotice = `Calling "deleteNode" with a nodeId is deprecated. Please pass an object containing a full node instead: deleteNode({ node })`
    expect(console.warn).toHaveBeenCalledWith(deprecationNotice)

    console.warn.mockRestore()
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
      {
        name: `tests`,
      }
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
      {
        name: `tests`,
      }
    )
    let state = nodeReducer(undefined, action)

    const addFieldAction = actions.createNodeField(
      {
        node: state[`hi`],
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
      {
        name: `tests`,
      }
    )
    let state = nodeReducer(undefined, action)

    const addFieldAction = actions.createNodeField(
      {
        node: state[`hi`],
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
          node: state[`hi`],
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
        {
          name: `pluginB`,
        }
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
        {
          name: `pluginA`,
        }
      )
    }

    expect(callActionCreator).toThrowErrorMatchingSnapshot()
  })

  it(`does not crash when delete node is called on undefined`, () => {
    actions.deleteNode(undefined, {
      name: `tests`,
    })
    expect(Object.keys(store.getState().nodes).length).toEqual(0)
  })
})
