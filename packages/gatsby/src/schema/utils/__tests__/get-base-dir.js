const getBaseDir = require(`../get-base-dir`)

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
    dir: `/home/me/gatsby`,
    internal: {
      type: `File`,
    },
  },
  {
    id: 3,
    parent: null,
    name: `Qux`,
    internal: {
      type: `Single`,
    },
  },
]

const node = nodes[0]
const single = nodes[3]

const { getById } = require(`../../db`)
// We need to mock the whole module (just using `getById = jest.fn()` won't work,
// while it _does_ work in `get-component-dir.js`).
// This is because of how `require` works!
// @see https://github.com/facebook/jest/issues/936#issuecomment-214939935
jest.mock(`../../db`)
getById.mockImplementation(id => nodes.find(n => n.id === id))

describe(`getBaseDir util`, () => {
  it(`finds parent File node and returns dir`, () => {
    const baseDir = getBaseDir(node)
    const expected = `/home/me/gatsby`
    expect(baseDir).toBe(expected)
  })

  it(`returns undefined when no parent File node can be found`, () => {
    const baseDir = getBaseDir(single)
    expect(baseDir).toBeUndefined()
  })
})
