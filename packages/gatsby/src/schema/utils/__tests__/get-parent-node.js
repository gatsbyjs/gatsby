const getParentNode = require(`../get-parent-node`)
const { trackObjects } = require(`../node-tracking`)

const obj = { foo: `bar` }
const nestedObj = [{ baz: `qux` }]

const nodes = [
  {
    id: 0,
    parent: 1,
    name: `Foo`,
    obj,
    foo: [
      {
        bar: {
          nestedObj,
        },
      },
    ],
    internal: {
      type: `Node`,
    },
  },
]

const node = nodes[0]

trackObjects(node)

const { getById } = require(`../../db`)
jest.mock(`../../db`)
getById.mockImplementation(id => nodes.find(n => n.id === id))

describe(`getParentNode util`, () => {
  it(`returns an object's parent node`, () => {
    const parent = getParentNode(obj)
    const expected = node
    expect(parent).toBe(expected)
  })

  it(`returns a deeply nested object's parent node`, () => {
    const parent = getParentNode(nestedObj)
    const expected = node
    expect(parent).toBe(expected)
  })

  it(`returns the node if the object is itself a node`, () => {
    const parent = getParentNode(node)
    const expected = node
    expect(parent).toBe(expected)
  })

  it(`returns null when no object provided`, () => {
    const parent = getParentNode(null)
    expect(parent).toBeUndefined()
  })
})
