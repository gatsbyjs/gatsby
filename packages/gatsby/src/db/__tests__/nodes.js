const { actions } = require(`../../redux/actions`)
const { store } = require(`../../redux`)
const { getNode, getNodes } = require(`../../redux/nodes`)

const report = require(`gatsby-cli/lib/reporter`)
jest.mock(`gatsby-cli/lib/reporter`)

describe(`nodes db tests`, () => {
  beforeEach(() => {
    store.dispatch({ type: `DELETE_CACHE` })
  })

  it(`warns when using old touchNode signature `, () => {
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
      actions.touchNode(
        { nodeId: `hi` },
        {
          name: `tests`,
        }
      )
    )
    expect(getNode(`hi`)).toBeDefined()
    const deprecationNotice =
      `Calling "touchNode" with an object containing the nodeId is deprecated. Please pass ` +
      `the node directly to the function: touchNode(node) ` +
      `"touchNode" was called by tests`
    expect(report.warn).toHaveBeenCalledWith(deprecationNotice)
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
      actions.deleteNode(getNode(`hi`), {
        name: `tests`,
      })
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
      actions.deleteNode(getNode(`hi`), {
        name: `tests`,
      })
    )
    expect(getNodes()).toHaveLength(0)
  })

  it(`allows deleting nodes`, () => {
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
    )
    store.dispatch(actions.deleteNode(getNode(`hi`)))
    expect(getNode(`hi`)).toBeUndefined()
  })

  it(`warns when using old deleteNode signature `, () => {
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
      actions.deleteNode(
        { node: getNode(`hi`) },
        {
          name: `tests`,
        }
      )
    )
    expect(getNode(`hi`)).toBeUndefined()
    const deprecationNotice =
      `Calling "deleteNode" with {node} is deprecated. Please pass ` +
      `the node directly to the function: deleteNode(node) ` +
      `"deleteNode" was called by tests`
    expect(report.warn).toHaveBeenCalledWith(deprecationNotice)
  })

  it(`throws an error when trying to delete a node of a type owned from another plugin`, () => {
    expect(() => {
      store.dispatch(
        actions.createNode(
          {
            id: `hi`,
            children: [],
            parent: `test`,
            internal: {
              contentDigest: `hasdfljds`,
              type: `Other`,
            },
          },
          {
            name: `other`,
          }
        )
      )
      store.dispatch(
        actions.deleteNode(getNode(`hi`), {
          name: `tests`,
        })
      )
    }).toThrow(/deleted/)
  })

  it(`does not crash when delete node is called on undefined`, () => {
    actions.deleteNode(undefined, {
      name: `tests`,
    })
    expect(getNodes()).toHaveLength(0)
  })
})
