const { trackObjects, getParentNodeId } = require(`../node-tracking`)

const obj = { foo: `bar` }
const nestedObj = { baz: `quz` }
const date = new Date()
const array = [1, 2, 3]

const square = {}
const circular = { square }
square.circular = circular

const node = {
  id: 0,
  parent: null,
  children: [],
  internal: {
    type: `Foo`,
  },
  obj,
  foo: [
    {
      bar: {
        obj,
        nestedObj,
      },
      array,
      date,
    },
  ],
  circular,
}

trackObjects(node)

describe(`Node tracking`, () => {
  it(`handles objects`, () => {
    expect(getParentNodeId(obj)).toBe(node.id)
  })

  it(`handles nested objects`, () => {
    expect(getParentNodeId(nestedObj)).toBe(node.id)
  })

  // FIXME: No need to track dates. They are scalars!
  it(`handles dates`, () => {
    expect(getParentNodeId(date)).toBe(node.id)
  })

  it(`handles arrays`, () => {
    expect(getParentNodeId(array)).toBe(node.id)
  })

  it(`handles objects with circular references`, () => {
    expect(getParentNodeId(circular)).toBe(node.id)
  })

  it(`returns undefined for untracked objects`, () => {
    expect(getParentNodeId({})).toBeUndefined()
  })
})
