const { start, getDb, colls } = require(`../index`)
const { createNode, deleteNode } = require(`../nodes`)

const type = `Test`
const node = {
  id: `1`,
  foo: `bar`,
  internal: { type: type },
}

beforeAll(start)

describe(`node`, () => {
  it(`should create node ID index`, () => {
    createNode(node)
    const nodeMetaColl = getDb().getCollection(colls.nodeMeta.name)
    expect(nodeMetaColl).toBeDefined()
    const nodeMeta = nodeMetaColl.by(`id`, node.id)
    const nodeTypeColl = getDb().getCollection(nodeMeta.typeCollName)
    expect(nodeTypeColl).toBeDefined()
    expect(nodeTypeColl.name).toEqual(`gatsby:nodeType:${type}`)
  })

  it(`should delete node ID index`, () => {
    deleteNode(node)
    const nodeMetaColl = getDb().getCollection(colls.nodeMeta.name)
    const nodeMeta = nodeMetaColl.by(`id`, node.id)
    expect(nodeMeta).toBeUndefined()
  })
})
