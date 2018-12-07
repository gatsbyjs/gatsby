const getAbsolutePath = require(`../get-absolute-path`)

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
jest.mock(`../../db`)
getById.mockImplementation(id => nodes.find(n => n.id === id))

describe(`getAbsolutePath util`, () => {
  it(`finds parent File node and constructs absolute path`, () => {
    const relativePath = `foo/bar.baz`
    const path = getAbsolutePath(node, relativePath)
    const expected = `/home/me/gatsby/foo/bar.baz`
    expect(path).toBe(expected)
  })

  it(`accepts array of relative paths`, () => {
    const relativePath = [`foo/bar.baz`, `foo/bar/baz.qux`]
    const path = getAbsolutePath(node, relativePath)
    const expected = [
      `/home/me/gatsby/foo/bar.baz`,
      `/home/me/gatsby/foo/bar/baz.qux`,
    ]
    expect(path).toEqual(expected)
  })

  it(`returns null when no parent File node can be found`, () => {
    const relativePath = `foo/bar.baz`
    const path = getAbsolutePath(single, relativePath)
    expect(path).toBeNull()
  })
})
