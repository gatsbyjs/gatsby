const findAncestorNode = require(`../find-ancestor-node`)

const nodes = [
  {
    id: 0,
    parent: 1,
    name: `Foo`,
    internal: {
      type: `Node`,
    },
  },
  {
    id: 1,
    parent: 2,
    name: `Bar`,
    internal: {
      type: `Parent`,
    },
  },
  {
    id: 2,
    parent: null,
    name: `Baz`,
    internal: {
      type: `File`,
    },
  },
]

const node = nodes[0]
const parent = nodes[1]
const root = nodes[2]

const { getById } = require(`../../db`)
jest.mock(`../../db`)
getById.mockImplementation(id => nodes.find(n => n.id === id))

describe(`findAncestorNode util`, () => {
  it(`finds a node's ancestor by type`, () => {
    const predicate = node => node.internal.type === `Parent`
    const ancestor = findAncestorNode(node, predicate)
    expect(ancestor).toBe(parent)
  })

  it(`finds a node's ancestor by field`, () => {
    const predicate = node => node.name === `Baz`
    const ancestor = findAncestorNode(node, predicate)
    expect(ancestor).toBe(root)
  })

  it(`start node can be first match`, () => {
    const predicate = node => node.name === `Foo`
    const ancestor = findAncestorNode(node, predicate)
    expect(ancestor).toBe(node)
  })

  it(`returns null when no match`, () => {
    const predicate = node => node.name === `FooBar`
    const ancestor = findAncestorNode(node, predicate)
    expect(ancestor).toBeNull()
  })
})
