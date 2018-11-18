const { actions } = require(`../../redux/actions`)
const { getNode, getNodes } = require(`../nodes`)
const { store } = require(`../../redux`)
require(`./fixtures/ensure-loki`)()

describe(`nodes db tests`, () => {
  beforeEach(() => {
    store.dispatch({ type: `DELETE_CACHE` })
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
    expect(getNodes()).toHaveLength(1)
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
      actions.deleteNode(
        {
          node: getNode(`hi`),
        },
        {
          name: `tests`,
        }
      )
    )
    expect(getNodes()).toHaveLength(1)
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
      actions.deleteNode(
        { node: getNode(`hi`) },
        {
          name: `tests`,
        }
      )
    )
    expect(getNodes()).toHaveLength(0)
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
    expect(getNode(`hi`)).toMatchObject({ id: `hi` })
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

  it(`does not crash when delete node is called on undefined`, () => {
    actions.deleteNode(undefined, {
      name: `tests`,
    })
    expect(getNodes()).toHaveLength(0)
  })
})
